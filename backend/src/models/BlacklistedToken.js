import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Remove entries automatically once their original JWT would be expired.
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const BlacklistedToken = mongoose.model("BlacklistedToken", blacklistedTokenSchema);
