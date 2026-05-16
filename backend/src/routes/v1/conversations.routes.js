/**
 * @file conversations.routes.js
 * @description Rutas para la gestión de conversaciones y mensajes privados entre usuarios.
 */

import { Router } from "express";
import {
  listConversations,
  listConversationMessages,
  sendConversationMessage,
  createOrGetConversation,
} from "../../controllers/conversations.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import {
  conversationParamsSchema,
  sendMessageSchema,
  createConversationSchema,
} from "../../schemas/conversations.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Conversaciones privadas y mensajería
 */

/**
 * @swagger
 * /api/v1/conversations:
 *   get:
 *     summary: Listar conversaciones del usuario autenticado
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista paginada de conversaciones
 *       401:
 *         description: No autenticado
 *   post:
 *     summary: Crear una conversación o devolver la existente entre dos usuarios
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [participanteId]
 *             properties:
 *               participanteId:
 *                 type: string
 *                 example: "67d1f11b2a9a5f0cb5b3f0f1"
 *     responses:
 *       200:
 *         description: Conversación existente devuelta correctamente
 *       201:
 *         description: Conversación creada correctamente
 *       400:
 *         description: No puedes iniciar una conversación contigo mismo
 *       401:
 *         description: No autenticado
 */

router.get("/", requireAuth, listConversations);
router.post("/", requireAuth, validateBody(createConversationSchema), createOrGetConversation);

/**
 * @swagger
 * /api/v1/conversations/{conversationId}/messages:
 *   get:
 *     summary: Listar mensajes de una conversación
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Lista de mensajes de la conversación
 *       400:
 *         description: Conversación no encontrada o identificador inválido
 *       401:
 *         description: No autenticado
 *   post:
 *     summary: Enviar un mensaje en una conversación
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contenido]
 *             properties:
 *               contenido:
 *                 type: string
 *                 maxLength: 2000
 *                 example: "Buenas, te viene bien entrenar esta tarde?"
 *     responses:
 *       201:
 *         description: Mensaje enviado correctamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Conversación no encontrada
 */

router.get("/:conversationId/messages", requireAuth, validateParams(conversationParamsSchema), listConversationMessages);
router.post(
  "/:conversationId/messages",
  requireAuth,
  validateParams(conversationParamsSchema),
  validateBody(sendMessageSchema),
  sendConversationMessage
);

export default router;