/**
 * @file auth.controller.js
 * @description Controlador de autenticación. Gestiona el registro, inicio de sesión,
 * consulta del usuario autenticado, actualización de perfil y cierre de sesión.
 */

import jwt from "jsonwebtoken";
import { BlacklistedToken, User } from "../models/index.js";
import { logger } from "../config/logger.js";

/**
 * Genera un token JWT firmado con el ID y rol del usuario, con expiración de 7 días.
 * @param {string|object} userId - ID del usuario.
 * @param {string} rol - Rol del usuario.
 * @returns {string} Token JWT firmado.
 */
function signToken(userId, rol) {
  return jwt.sign({ sub: userId.toString(), rol }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Devuelve el formato público del usuario autenticado, omitiendo datos sensibles.
 * @param {object} user - Documento de usuario de Mongoose.
 * @returns {object} Datos públicos del usuario.
 */
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

/**
 * Registra un nuevo usuario. Verifica que el email y el alias no estén en uso
 * y devuelve un token JWT junto con los datos del usuario creado.
 * @route POST /auth/register
 */
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

/**
 * Actualiza los datos de perfil de un usuario (edad, zona y deportes).
 * Marca el perfil como completo si tiene todos los campos obligatorios.
 * @route PATCH /auth/update-profile
 */
export const update_profile = async (req, res, next) => {
  logger.info("update-profile", req.body);
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

/**
 * Inicia sesión verificando las credenciales del usuario y devuelve un token JWT.
 * Rechaza el acceso si la cuenta está bloqueada.
 * @route POST /auth/login
 */
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

/**
 * Devuelve los datos del usuario autenticado a partir del token JWT.
 * @route GET /auth/me
 */
export const getAuthMe = (req, res) => {
  return res.json({ ok: true, user: userPublic(req.user) });
};

/**
 * Cierra la sesión añadiendo el token actual a la blacklist para invalidarlo.
 * @route POST /auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const tokenHash = req.authTokenHash;
    const expiresAt = req.authTokenExpiration;

    // Validación del token 
    if (!tokenHash) {
      return res.status(400).json({ ok: false, message: "No se pudo invalidar el token" });
    }

    // Actualización de la base de datos
    await BlacklistedToken.updateOne(
      { tokenHash },
      { $setOnInsert: { tokenHash, expiresAt } },
      { upsert: true }
    );

    return res.json({ ok: true, message: "Sesión cerrada correctamente" });
  } catch (err) {
    next(err);
  }
};