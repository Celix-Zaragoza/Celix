/**
 * @file user.schema.js
 * @description Esquemas de validación para la actualización del perfil de usuario, usando Zod.
 */

import { z } from "zod";

/**
 * Esquema de validación para un deporte con su nivel asociado.
 * El nivel va de 1 (principiante) a 5 (experto).
 */
const deporteNivelSchema = z.object({
  deporte: z.string().trim().min(1).max(80),
  nivel: z.number().int().min(1).max(5).default(1),
});

/**
 * Esquema de validación para la actualización del perfil del usuario autenticado.
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 */
export const updateMeSchema = z.object({
  nombre: z.string().trim().min(2).max(120).optional(),
  alias: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9_]+$/).optional(),
  edad: z.number().int().min(13).max(120).optional(),
  zona: z.string().trim().min(1).max(120).optional(),
  bio: z.string().trim().max(300).optional(),
  avatar: z.string().trim().optional(),
  deportesNivel: z.array(deporteNivelSchema).min(1).max(20).optional(),
});