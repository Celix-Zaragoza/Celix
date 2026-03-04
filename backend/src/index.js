import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import mongoose from "mongoose";

import { swaggerSpec } from "./config/swagger.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "celix-api" });
});

app.get("/ready", (req, res) => {
  const dbState = mongoose.connection.readyState;

  if (dbState === 1) {
    return res.json({
      ok: true,
      database: "connected"
    });
  }

  res.status(503).json({
    ok: false,
    database: "not connected"
  });
});

await connectDB();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});