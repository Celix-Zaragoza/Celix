/**
 * @file db.js
 * @description Configuración y conexión a la base de datos MongoDB mediante Mongoose.
 */

import mongoose from "mongoose";
import { logger } from "./logger.js";

/**
 * Establece la conexión con MongoDB usando la URI definida en las variables de entorno.
 * Si la URI no está definida o la conexión falla, registra el error en el logger.
 */
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