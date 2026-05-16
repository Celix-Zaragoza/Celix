/**
 * @file auth.schema.js
 * @description Esquemas de validación para los datos de autenticación,
 * usando Zod.
 */

import { z } from "zod";

/**
 * Esquema de validación para el inicio de sesión.
 * Valida email y contraseña.
 */
export const loginSchema = z.object({
  email: z.email("Email inválido").trim().toLowerCase(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(128),
});

/**
 * Esquema de validación para el registro de un nuevo usuario.
 * Valida nombre, email, contraseña y alias.
 */
export const registerSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(120),
  email: z.email("Email inválido").trim().toLowerCase(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(128),
  alias: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9_]+$/),
});