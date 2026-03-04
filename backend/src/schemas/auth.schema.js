import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email inválido").trim().toLowerCase(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(128),
});

export const registerSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(120),
  email: z.email("Email inválido").trim().toLowerCase(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(128),
  alias: z
    .string()
    .trim()
    .min(3, "El alias debe tener al menos 3 caracteres")
    .max(40)
    .regex(/^[a-zA-Z0-9_]+$/, "El alias solo permite letras, números y guion bajo"),
  edad: z
    .number({ message: "Edad inválida" })
    .int("La edad debe ser un número entero")
    .min(13, "Edad mínima 13")
    .max(120, "Edad máxima 120"),
  zona: z.string().trim().min(1, "La zona es obligatoria").max(120),
  deportes: z.array(z.string().trim().min(1)).min(1, "Selecciona al menos un deporte").max(20),
  nivelGeneral: z
    .number({ message: "Nivel general inválido" })
    .min(0, "Nivel general mínimo 0")
    .max(100, "Nivel general máximo 100"),
});