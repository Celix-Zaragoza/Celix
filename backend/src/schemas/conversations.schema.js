import { z } from "zod";

export const conversationParamsSchema = z.object({
  conversationId: z.string().trim().min(1, "conversationId es obligatorio"),
});

export const sendMessageSchema = z.object({
  contenido: z.string().trim().min(1, "El contenido es obligatorio").max(2000),
});

export const createConversationSchema = z.object({
  participanteId: z.string().min(1, "Se requiere el ID del participante"),
});
