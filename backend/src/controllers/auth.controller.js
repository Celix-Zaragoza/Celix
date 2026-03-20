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
    const { nombre, email, password, alias } = req.body;
    
    const existing = await User.findOne({ $or: [{ email }, { alias }] });
    if (existing) {
      const field = existing.email === email ? "email" : "alias";
      return res.status(409).json({ ok: false, message: `El ${field} ya está en uso` });
    }

    const user = await User.create({
      nombre,
      email,
      password,
      alias,
    });

    // Retornamos token y datos básicos
    return res.status(201).json({ ok: true, token: signToken(user._id, user.rol), user: userPublic(user) });
  } catch (err) { next(err); }
};

export const update_profile = async (req, res, next) => {
  console.log("update-profile", req.body);
  try {
    const { userId, edad, zona, deportesNivel } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });

    // Actualizamos solo los campos que vienen
    if (edad !== undefined) user.edad = edad;
    if (zona) user.zona = zona;
    if (deportesNivel) user.deportesNivel = deportesNivel;

    // Si ya tiene todos los campos importantes, perfilCompleto = true
    user.perfilCompleto = !!(user.edad && user.zona && user.deportesNivel.length > 0);

    await user.update();

    return res.status(200).json({ ok: true, user: userPublic(user) });
  } catch (err) {
    next(err);
  }
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