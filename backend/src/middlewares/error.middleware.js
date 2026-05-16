/**
 * @file error.middleware.js
 * @description Middleware global de manejo de errores.
 * Captura cualquier error propagado con next(err) y devuelve una respuesta JSON normalizada.
 */

import { logger } from "../config/logger.js";

/**
 * Maneja los errores de la aplicación de forma centralizada.
 * Registra en el logger los errores de servidor (5xx) y responde con el estado y mensaje del error.
 * @param {Error} err - Error capturado.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */
export const errorHandler = (err, req, res, _next) => {
  const status = err?.status || 500;
  const message = err?.message || "Unexpected error";

  if (status >= 500) {
    logger.error(err);
  }

  res.status(status).json({
    ok: false,
    message,
  });
};