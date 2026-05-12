/**
 * @file app.js
 * @description Configuración principal de la aplicación Express.
 * Registra middlewares globales, rutas de salud, documentación Swagger y el router de la API.
 */

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

/**
 * Indica que el servidor está en ejecución.
 * @route GET /health
 */
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "celix-api" });
});

/**
 * Comprueba que el servidor está listo para recibir peticiones,
 * verificando la conexión con la base de datos.
 * @route GET /ready
 */
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