/**
 * @file validate.middleware.js
 * @description Middlewares de validación de datos de entrada.
 * Valida el body, los parámetros de ruta y los query params de las peticiones.
 */

/**
 * Transforma los errores de Zod a un formato más legible.
 * @param {import("zod").ZodIssue[]} issues - Lista de errores de Zod.
 * @returns {{ path: string, message: string, code: string }[]} Errores formateados.
 */
const formatZodErrors = (issues) => {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
};

/**
 * Genera un middleware de validación para una fuente de datos de la petición.
 * Si la validación falla, responde con 400 y los errores formateados.
 * @param {import("zod").ZodSchema} schema - Esquema Zod con el que validar.
 * @param {"body"|"params"|"query"} source - Fuente de datos de la petición a validar.
 * @returns {import("express").RequestHandler} Middleware de validación.
 */
const makeValidator = (schema, source) => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const formattedErrors = formatZodErrors(result.error.issues);
      const firstErrorMessage = formattedErrors.length > 0 
        ? formattedErrors[0].message 
        : `Invalid ${source}`;

      return res.status(400).json({
        ok: false,
        message: firstErrorMessage, 
        errors: formattedErrors,
      });
    }

    req[source] = result.data;
    return next();
  };
};

/** Valida el body de la petición contra el esquema proporcionado. */
export const validateBody = (schema) => makeValidator(schema, "body");

/** Valida los parámetros de ruta de la petición contra el esquema proporcionado. */
export const validateParams = (schema) => makeValidator(schema, "params");

/** Valida los query params de la petición contra el esquema proporcionado. */
export const validateQuery = (schema) => makeValidator(schema, "query");