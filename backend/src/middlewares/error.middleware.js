export const errorHandler = (err, req, res, _next) => {
  const status = err?.status || 500;
  const message = err?.message || "Unexpected error";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    ok: false,
    message,
  });
};