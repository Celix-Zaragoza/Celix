/**
 * @file events.routes.js
 * @description Rutas para la consulta de eventos deportivos públicos de Zaragoza.
 */

import { Router } from "express";
import { getSportsEvents } from "../../controllers/events.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Eventos de agenda pública de Zaragoza
 */

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Lista eventos deportivos de Zaragoza (paginacion interna completa)
 *     description: >
 *       Consulta la API de Zaragoza y concatena internamente todas las paginas de resultados.
 *       Devuelve los eventos ya normalizados al formato de la base de datos.
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: rows
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "daysLeft asc"
 *       - in: query
 *         name: theme
 *         schema:
 *           type: string
 *           default: "Deporte"
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Texto libre adicional
 *     responses:
 *       200:
 *         description: Lista completa de eventos normalizados obtenida correctamente
 *       500:
 *         description: Error al consultar o procesar la API de Zaragoza
 */
router.get("/", getSportsEvents);

export default router;
