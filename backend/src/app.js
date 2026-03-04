import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import mongoose from "mongoose";
import { swaggerSpec } from "./config/swagger.js";
import apiRouter from "./routes/index.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "celix-api" });
});

app.get("/ready", (req, res) => {
  const dbState = mongoose.connection.readyState;

  if (dbState === 1) {
    return res.json({
      ok: true,
      database: "connected",
    });
  }

  res.status(503).json({
    ok: false,
    database: "not connected",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;