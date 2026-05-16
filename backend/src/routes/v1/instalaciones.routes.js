/**
 * @file instalaciones.routes.js
 * @description Rutas para la consulta de instalaciones deportivas de Zaragoza.
 */

import { Router } from "express";
import { getInstalaciones } from "../../controllers/instalaciones.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/v1/instalaciones:
 *   get:
 *     summary: Lista instalaciones deportivas de Zaragoza
 *     tags: [Instalaciones]
 *     responses:
 *       200:
 *         description: Lista de instalaciones con coordenadas
 */
router.get("/", requireAuth, getInstalaciones);

export default router;