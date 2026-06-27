import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: IOServer | null = null;

export const initSocket = (httpServer: HTTPServer, clientOrigin: string): IOServer => {
  io = new IOServer(httpServer, {
    cors: { origin: clientOrigin, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    socket.on("join_store", (storeId: string) => {
      if (typeof storeId === "string" && storeId.length > 0) {
        socket.join(`store:${storeId}`);
        console.log(`[socket] ${socket.id} joined store:${storeId}`);
      }
    });

    socket.on("leave_store", (storeId: string) => {
      if (typeof storeId === "string" && storeId.length > 0) {
        socket.leave(`store:${storeId}`);
        console.log(`[socket] ${socket.id} left store:${storeId}`);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[socket] client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

export const getIO = (): IOServer => {
  if (!io) throw new Error("Socket.io not initialized. Call initSocket first.");
  return io;
};

export const emitToStore = (storeId: string, event: string, payload: unknown): void => {
  if (!io) return; 
  io.to(`store:${storeId}`).emit(event, payload);
};
