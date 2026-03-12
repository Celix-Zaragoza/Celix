import { z } from "zod";

const deporteNivelSchema = z.object({
  deporte: z.string().trim().min(1).max(80),
  nivel: z.number().int().min(1).max(5).default(1),
});

export const updateMeSchema = z.object({
  nombre: z.string().trim().min(2).max(120).optional(),
  alias: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9_]+$/).optional(),
  edad: z.number().int().min(13).max(120).optional(),
  zona: z.string().trim().min(1).max(120).optional(),
  bio: z.string().trim().max(300).optional(),
  avatar: z.string().trim().optional(),
  deportesNivel: z.array(deporteNivelSchema).min(1).max(20).optional(),
  nivelGeneral: z.number().min(0).max(100).optional(),
});