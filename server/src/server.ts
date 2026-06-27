import http from "http";
import dotenv from "dotenv";
import { createApp } from "./app";
import { connectDB } from "./config/db";
import { initSocket } from "./config/socket";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/order_mgmt";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

const start = async () => {
  await connectDB(MONGO_URI);

  const app = createApp(CLIENT_ORIGIN);
  const httpServer = http.createServer(app);

  initSocket(httpServer, CLIENT_ORIGIN);

  httpServer.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error("[server] failed to start", err);
  process.exit(1);
});
