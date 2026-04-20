const formatZodErrors = (issues) => {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
};

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

export const validateBody = (schema) => makeValidator(schema, "body");
export const validateParams = (schema) => makeValidator(schema, "params");
export const validateQuery = (schema) => makeValidator(schema, "query");