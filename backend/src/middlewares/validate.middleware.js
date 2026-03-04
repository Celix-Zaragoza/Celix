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
      return res.status(400).json({
        ok: false,
        message: `Invalid ${source}`,
        errors: formatZodErrors(result.error.issues),
      });
    }

    req[source] = result.data;
    return next();
  };
};

export const validateBody = (schema) => makeValidator(schema, "body");
export const validateParams = (schema) => makeValidator(schema, "params");
export const validateQuery = (schema) => makeValidator(schema, "query");