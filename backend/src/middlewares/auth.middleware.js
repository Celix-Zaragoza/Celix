import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ ok: false, message: "Token no proporcionado" });
    }
    const token = authHeader.slice(7);
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        ok: false,
        message: err.name === "TokenExpiredError" ? "Token expirado" : "Token inválido",
      });
    }
    const user = await User.findById(payload.sub).select("-password");
    if (!user) return res.status(401).json({ ok: false, message: "Usuario no encontrado" });
    if (user.bloqueado) return res.status(403).json({ ok: false, message: "Tu cuenta ha sido bloqueada" });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ ok: false, message: "No autenticado" });
  if (!roles.includes(req.user.rol))
    return res.status(403).json({ ok: false, message: "Sin permisos para esta acción" });
  next();
};