/**
 * @file notFound.middleware.js
 * @description Middleware para manejar rutas no encontradas.
 * Responde con 404 cuando ninguna ruta de la aplicación coincide con la petición.
 */

/**
 * Responde con 404 cuando la ruta solicitada no existe.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    ok: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};