import jwt from "jsonwebtoken";
import crypto from "crypto";
import { BlacklistedToken, User } from "../models/index.js";

export const requireAuth = async (req, res, next) => {
  try {
    // Comprueba que existe un token dentro de la petición del cliente
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ ok: false, message: "Token no proporcionado" });
    }

    // Comprueba que el token no exista dentro de los tokens betados por el servidor
    const token = authHeader.slice(7);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const blacklisted = await BlacklistedToken.exists({ tokenHash });
    if (blacklisted) {
      return res.status(401).json({ ok: false, message: "Token invalidado" });
    }

    // Si el token no es válido, da error
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        ok: false,
        message: err.name === "TokenExpiredError" ? "Token expirado" : "Token inválido",
      });
    }

    // Comprueba que exista el usuario perteneciente al token y no esté bloqueado
    const user = await User.findById(payload.sub).select("-password");
    if (!user) return res.status(401).json({ ok: false, message: "Usuario no encontrado" });
    if (user.bloqueado) return res.status(403).json({ ok: false, message: "Tu cuenta ha sido bloqueada" });
    
    // Devuelve el objeto del usuario en la petición, así 
    req.user = user;
    req.authToken = token;
    req.authTokenExpiration = new Date(payload.exp * 1000);
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