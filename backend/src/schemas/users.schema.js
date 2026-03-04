import { z } from "zod";

export const updateMeSchema = z.object({
  nombre: z.string().trim().min(2).max(120).optional(),
  alias: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[a-zA-Z0-9_]+$/, "El alias solo permite letras, números y guion bajo")
    .optional(),
  bio: z.string().trim().max(500).optional(),
  edad: z.number().int().min(13).max(120).optional(),
  zona: z.string().trim().min(1).max(120).optional(),
  deportes: z.array(z.string().trim().min(1)).min(1).max(20).optional(),
  nivelGeneral: z.number().min(0).max(100).optional(),
});