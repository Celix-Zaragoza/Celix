import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// TTL index — MongoDB elimina automáticamente el documento cuando expira el token
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const BlacklistedToken = mongoose.model("BlacklistedToken", blacklistedTokenSchema);