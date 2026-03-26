// backend/src/routes/v1/conversations.routes.js
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
 *   description: Conversaciones y mensajería
 */

/**
 * @swagger
 * /api/v1/conversations:
 *   get:
 *     summary: Lista las conversaciones del usuario autenticado
 *     tags: [Conversations]
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
 *         description: Conversaciones obtenidas correctamente
 */

router.get("/", requireAuth, listConversations);
router.get("/:conversationId/messages", requireAuth, validateParams(conversationParamsSchema), listConversationMessages);

/**
 * @swagger
 * /api/v1/conversations/{conversationId}/messages:
 *   post:
 *     summary: Envía un mensaje en una conversación
 *     tags: [Conversations]
 *     security: []
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
 *                 example: "Mensaje de prueba."
 *     responses:
 *       201:
 *         description: Mensaje enviado correctamente
 *       404:
 *         description: Conversación no encontrada
 */

router.post(
  "/:conversationId/messages",
  requireAuth,
  validateParams(conversationParamsSchema),
  validateBody(sendMessageSchema),
  sendConversationMessage
);

export default router;
