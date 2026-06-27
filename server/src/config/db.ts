import mongoose from "mongoose";

export const connectDB = async (uri: string): Promise<void> => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri);
    console.log(`[db] connected -> ${mongoose.connection.name}`);
  } catch (err) {
    console.error("[db] connection failed", err);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] disconnected");
  });
};
