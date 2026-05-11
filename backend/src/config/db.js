import mongoose from "mongoose";
import { logger } from "./logger.js";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      logger.error("❌ MONGO_URI no está definida en variables de entorno");
      return; // o process.exit(1)
    }

    await mongoose.connect(uri);

    logger.info("✅ Conectado a MongoDB");
  } catch (error) {
    logger.error("❌ Error conectando a MongoDB:", error);
  }
};