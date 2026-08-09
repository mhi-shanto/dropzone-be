import http from "http";
import app from "./app";
import { env } from "./config/env";
import { testConnection } from "./config/db";
import { initSocket } from "./sockets";
import { startSweeper } from "./sweeper";

const PORT = env.PORT;
const server = http.createServer(app);

initSocket(server);

async function startServer() {
  await testConnection();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(
      `🏥 Health check endpoint: http://localhost:${PORT}/api/health`,
    );
    startSweeper();
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
