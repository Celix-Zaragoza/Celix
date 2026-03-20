import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email inválido").trim().toLowerCase(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(128),
});

/*const deporteNivelSchema = z.object({
  deporte: z.string().trim().min(1).max(80),
  nivel: z.number().int().min(1).max(5).default(1),
});*/

export const registerSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(120),
  email: z.email("Email inválido").trim().toLowerCase(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(128),
  alias: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9_]+$/),
  /*edad: z.number().int().min(13).max(120).optional(),
  zona: z.string().trim().min(1).max(120).optional(),
  deportesNivel: z.array(deporteNivelSchema).max(20).optional(),
  nivelGeneral: z.number().min(0).max(100).optional().default(0),*/
});