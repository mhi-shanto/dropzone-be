import axios from "axios";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:8080/api";
const CONCURRENT_USERS = 50;
const CONFIG_PATH = path.join(__dirname, "load-test.config.json");

const USER_CREDENTIALS = Array.from({ length: CONCURRENT_USERS }, (_, i) => ({
  email: `testuser_${i + 1}@example.com`,
  password: "password123",
}));

function resolveDropId(): string {
  if (process.env.DROP_ID) {
    return process.env.DROP_ID;
  }

  if (fs.existsSync(CONFIG_PATH)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8")) as {
      dropId?: string;
    };

    if (config.dropId) {
      return config.dropId;
    }
  }

  throw new Error(
    "No DROP_ID found. Run `npx ts-node scripts/seed-load-test.ts` first, or set DROP_ID env var.",
  );
}

const DROP_ID = resolveDropId();

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function loginAll(): Promise<string[]> {
  console.log(`\n[Step 1] Logging in ${CONCURRENT_USERS} users...`);

  const results = await Promise.allSettled(
    USER_CREDENTIALS.map((creds) =>
      axios
        .post(`${BASE_URL}/auth/login`, creds)
        .then((res) => res.data.token as string),
    ),
  );

  const tokens: string[] = [];
  let failed = 0;

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      tokens.push(result.value);
    } else {
      console.error(
        `  ✗ Login failed for ${USER_CREDENTIALS[i].email}:`,
        result.reason?.response?.data?.message || result.reason?.message,
      );
      failed++;
    }
  });

  console.log(`  ✓ ${tokens.length} users logged in, ${failed} failed`);

  if (tokens.length === 0) {
    throw new Error(
      "No users could log in — run seed-load-test.ts and ensure the backend is running.",
    );
  }

  return tokens;
}

async function checkStock(label: string, token: string): Promise<number> {
  const { data } = await axios.get(`${BASE_URL}/drops/${DROP_ID}`, {
    headers: authHeader(token),
  });
  const stock = data.drop.availableStock as number;
  console.log(`  [${label}] available_stock = ${stock}`);
  return stock;
}

interface ReserveResult {
  status: "success" | "sold_out" | "error";
  statusCode: number;
  message: string;
  userIndex: number;
}

async function fireReserves(tokens: string[]): Promise<ReserveResult[]> {
  console.log(
    `\n[Step 3] Firing ${tokens.length} concurrent reserve requests...`,
  );
  const start = Date.now();

  const settled = await Promise.allSettled(
    tokens.map((token, i) =>
      axios
        .post(
          `${BASE_URL}/drops/${DROP_ID}/reserve`,
          {},
          { headers: authHeader(token) },
        )
        .then((res) => ({
          status: "success" as const,
          statusCode: res.status,
          message: "Reserved",
          userIndex: i,
        })),
    ),
  );

  const elapsed = Date.now() - start;
  console.log(`  All responses received in ${elapsed}ms`);

  return settled.map((result, i) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    const statusCode = result.reason?.response?.status || 0;
    const message =
      result.reason?.response?.data?.message || result.reason?.message;

    return {
      status: statusCode === 409 ? ("sold_out" as const) : ("error" as const),
      statusCode,
      message,
      userIndex: i,
    };
  });
}

function analyseResults(results: ReserveResult[]): boolean {
  const successes = results.filter((r) => r.status === "success");
  const soldOuts = results.filter((r) => r.status === "sold_out");
  const errors = results.filter((r) => r.status === "error");

  console.log("\n[Step 4] Results:");
  console.log(`  ✓ Succeeded (201):        ${successes.length}`);
  console.log(`  ✗ Sold out (409):         ${soldOuts.length}`);
  console.log(`  ! Unexpected errors:      ${errors.length}`);

  if (successes.length > 0) {
    console.log(`\n  Winning user: testuser_${successes[0].userIndex + 1}`);
  }

  if (errors.length > 0) {
    console.log("\n  Unexpected errors:");
    errors.forEach((e) => {
      console.log(
        `    [user ${e.userIndex + 1}] ${e.statusCode} — ${e.message}`,
      );
    });
  }

  const passed: string[] = [];
  const failed: string[] = [];

  successes.length === 1
    ? passed.push("Exactly 1 reservation succeeded")
    : failed.push(`Expected 1 success, got ${successes.length}`);

  soldOuts.length === results.length - 1
    ? passed.push(
        `All other ${soldOuts.length} requests correctly rejected as sold out`,
      )
    : failed.push(
        `Expected ${results.length - 1} sold-out rejections, got ${soldOuts.length}`,
      );

  errors.length === 0
    ? passed.push("No unexpected errors")
    : failed.push(`${errors.length} unexpected error(s) — check server logs`);

  console.log("\n[Assertions]");
  passed.forEach((msg) => console.log(`  ✅ ${msg}`));
  failed.forEach((msg) => console.log(`  ❌ ${msg}`));

  return failed.length === 0;
}

async function verifyFinalStock(
  stockBefore: number,
  token: string,
): Promise<boolean> {
  const stockAfter = await checkStock("After", token);
  const expected = stockBefore - 1;
  const correct = stockAfter === expected;

  console.log(`\n[Step 5] DB stock check:`);
  console.log(`  Before: ${stockBefore}`);
  console.log(`  After:  ${stockAfter}`);
  console.log(`  Expected: ${expected}`);
  correct
    ? console.log(
        "  ✅ Stock decremented by exactly 1 — no overselling, no double-deduction",
      )
    : console.log(
        `  ❌ Stock is wrong — expected ${expected}, got ${stockAfter}`,
      );

  return correct;
}

async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log(" Atomic Reservation Concurrency Test");
  console.log(`  Drop ID:     ${DROP_ID}`);
  console.log(`  Concurrent:  ${CONCURRENT_USERS} users`);
  console.log("=".repeat(60));

  try {
    const tokens = await loginAll();

    console.log("\n[Step 2] Stock before test:");
    const stockBefore = await checkStock("Before", tokens[0]);

    if (stockBefore !== 1) {
      console.warn(`\n⚠️  WARNING: available_stock is ${stockBefore}, not 1.`);
      console.warn(
        "   Re-run seed-load-test.ts to create a fresh 1-unit drop.",
      );
      process.exit(1);
    }

    const results = await fireReserves(tokens);
    const assertionsPassed = analyseResults(results);
    const stockCorrect = await verifyFinalStock(stockBefore, tokens[0]);

    console.log("\n" + "=".repeat(60));
    if (assertionsPassed && stockCorrect) {
      console.log(
        " 🎉 ALL TESTS PASSED — Atomic reservation is working correctly.",
      );
    } else {
      console.log(" 💥 TEST FAILED — Check server logs and DB state.");
      process.exit(1);
    }
    console.log("=".repeat(60));
  } catch (err: any) {
    console.error("\n[Fatal]", err.message);
    process.exit(1);
  }
}

main();
