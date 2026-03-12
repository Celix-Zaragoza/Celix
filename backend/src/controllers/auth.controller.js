import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

function signToken(userId, rol) {
  return jwt.sign({ sub: userId.toString(), rol }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function userPublic(user) {
  return {
    id: user._id,
    nombre: user.nombre,
    email: user.email,
    alias: user.alias,
    edad: user.edad,
    zona: user.zona,
    deportesNivel: user.deportesNivel,
    avatar: user.avatar,
    rol: user.rol,
    perfilCompleto: user.perfilCompleto,
    numSeguidores: user.seguidores?.length ?? 0,
    numSiguiendo: user.siguiendo?.length ?? 0,
    createdAt: user.createdAt,
  };
}

export const register = async (req, res, next) => {
  try {
    const { nombre, email, password, alias, edad, zona, deportesNivel = [], nivelGeneral = 0 } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { alias }] });
    if (existing) {
      const field = existing.email === email ? "email" : "alias";
      return res.status(409).json({ ok: false, message: `El ${field} ya está en uso` });
    }

    const user = await User.create({
      nombre, email, password, alias, edad, zona, deportesNivel, nivelGeneral,
      perfilCompleto: !!(edad && zona && deportesNivel.length > 0),
    });

    return res.status(201).json({ ok: true, token: signToken(user._id, user.rol), user: userPublic(user) });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ ok: false, message: "Credenciales incorrectas" });
    }
    if (user.bloqueado) {
      return res.status(403).json({ ok: false, message: "Tu cuenta ha sido bloqueada" });
    }
    return res.json({ ok: true, token: signToken(user._id, user.rol), user: userPublic(user) });
  } catch (err) { next(err); }
};

export const getAuthMe = (req, res) => {
  return res.json({ ok: true, user: userPublic(req.user) });
};