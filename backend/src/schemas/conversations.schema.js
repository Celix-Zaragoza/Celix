/**
 * @file conversation.schema.js
 * @description Esquemas de validación para las operaciones sobre conversaciones
 * y mensajes, usando Zod.
 */

import { z } from "zod";

/**
 * Esquema de validación para los parámetros de ruta que contienen un ID de conversación.
 */
export const conversationParamsSchema = z.object({
  conversationId: z.string().trim().min(1, "conversationId es obligatorio"),
});

/**
 * Esquema de validación para el envío de un mensaje en una conversación.
 */
export const sendMessageSchema = z.object({
  contenido: z.string().trim().min(1, "El contenido es obligatorio").max(2000),
});

/**
 * Esquema de validación para la creación de una nueva conversación.
 * Requiere el ID del otro participante.
 */
export const createConversationSchema = z.object({
  participanteId: z.string().min(1, "Se requiere el ID del participante"),
});
