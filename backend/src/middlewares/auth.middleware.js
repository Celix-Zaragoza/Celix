export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: "Missing bearer token",
    });
  }

  req.auth = { token };
  return next();
};