/**
 * @file post.schema.js
 * @description Esquema de validación para la creación de publicaciones, usando Zod.
 */

import { z } from "zod";

/**
 * Esquema de validación para la creación de una nueva publicación.
 * Valida deporte, ubicación, contenido e imagen opcional.
 */
export const createPostSchema = z.object({
  deporte: z.string().trim().min(1, "El deporte es obligatorio").max(80),
  ubicacion: z.string().trim().min(1, "La ubicación es obligatoria").max(180),
  contenido: z.string().trim().min(1, "El contenido es obligatorio").max(500),
  tipo: z.string().optional(),
  imagen: z.string().url("URL de imagen inválida").optional().nullable(),
});