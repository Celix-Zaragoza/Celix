import { z } from "zod";

export const createPostSchema = z.object({
  deporte: z.string().trim().min(1, "El deporte es obligatorio").max(80),
  ubicacion: z.string().trim().min(1, "La ubicación es obligatoria").max(180),
  contenido: z.string().trim().min(1, "El contenido es obligatorio").max(500),
  tipo: z.string().optional(),
  imagen: z.string().url("URL de imagen inválida").optional().nullable(),
});