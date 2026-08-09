import axios from "axios";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:8080/api";
const USER_COUNT = 50;
const TEST_PASSWORD = "password123";
const CONFIG_PATH = path.join(__dirname, "load-test.config.json");

function testUserEmail(index: number): string {
  return `testuser_${index}@example.com`;
}

async function login(email: string): Promise<string> {
  const { data } = await axios.post(`${BASE_URL}/auth/login`, {
    email,
    password: TEST_PASSWORD,
  });
  return data.token;
}

async function seedUsers(): Promise<void> {
  console.log(`\n[Seeding] Creating ${USER_COUNT} test users...`);

  let created = 0;
  let skipped = 0;

  for (let i = 1; i <= USER_COUNT; i++) {
    const email = testUserEmail(i);
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email,
        password: TEST_PASSWORD,
      });
      created++;
      process.stdout.write(".");
    } catch (err: any) {
      if (err.response?.status === 409) {
        skipped++;
        process.stdout.write("s");
      } else {
        console.error(
          `\n  ✗ Failed to create ${email}:`,
          err.response?.data?.message || err.message,
        );
      }
    }
  }

  console.log(`\n  ✓ Created: ${created}, Skipped (already exist): ${skipped}`);
}

async function seedDrop(): Promise<string> {
  console.log("\n[Seeding] Creating a fresh 1-unit test drop...");

  try {
    const token = await login(testUserEmail(1));
    const { data } = await axios.post(
      `${BASE_URL}/drops`,
      {
        name: `Load Test Drop ${Date.now()}`,
        description: "Created by seed script for concurrency testing.",
        price: 199.99,
        totalStock: 1,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const dropId = data.drop.id as string;

    fs.writeFileSync(
      CONFIG_PATH,
      JSON.stringify({ dropId, createdAt: new Date().toISOString() }, null, 2),
    );

    console.log(`  ✓ Drop created`);
    console.log(`  ✓ Drop ID: ${dropId}`);
    console.log(`  ✓ available_stock: ${data.drop.availableStock}`);
    console.log(`  ✓ Saved to ${CONFIG_PATH}`);

    return dropId;
  } catch (err: any) {
    console.error(
      "  ✗ Failed to create drop:",
      err.response?.data?.message || err.message,
    );
    process.exit(1);
  }
}

async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log(" Load Test Seed Script");
  console.log("=".repeat(60));

  await seedUsers();
  await seedDrop();

  console.log("\n[Done] Run the concurrency test:");
  console.log("  npx ts-node scripts/load-test.ts");
}

main();
