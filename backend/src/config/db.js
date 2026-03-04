import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("❌ MONGO_URI no está definida en variables de entorno");
      return; // o process.exit(1)
    }

    await mongoose.connect(uri);

    console.log("✅ MongoDB conectado");
  } catch (error) {
    console.error("❌ Error conectando MongoDB:", error.message);
    // Si quieres que falle el deploy si no hay DB:
    // process.exit(1);
  }
};