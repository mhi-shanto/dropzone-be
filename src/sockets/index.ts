import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
  });

  if (!io) {
    throw new Error("Failed to initialize Socket.io server.");
  }

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  const corsOrigin = process.env.CLIENT_ORIGIN || "*";
  console.log(`🔌 Socket.io initialized (CORS origin: ${corsOrigin})`);

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.io accessed before initSocket() was called.");
  }
  return io;
}
