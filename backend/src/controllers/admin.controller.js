/**
 * @file admin.controller.js
 * @description Controlador de administración. Gestiona la moderación de publicaciones,
 * usuarios y eventos, incluyendo el envío de notificaciones por email en cada acción.
 */

import { Post, User } from "../models/index.js";
import { Event } from "../models/Event.js";
import {
  sendPostHiddenEmail,
  sendPostRestoredEmail,
  sendUserBlockedEmail,
  sendUserUnblockedEmail,
} from "../services/email.service.js";
import { logger } from "../config/logger.js";

// ── PUBLICACIONES ─────────────────────────────────────────────────────────────

/**
 * Devuelve las publicaciones paginadas para moderación, pudiéndolos filtrar por contenido y estado.
 * Incluye estadísticas del total de publicaciones visibles y ocultas.
 * @route GET /admin/posts
 */
export const listPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { eliminado: false };
    if (req.query.q) filter.contenido = { $regex: req.query.q, $options: "i" };
    if (req.query.estado === "ocultos") filter.oculto = true;
    else if (req.query.estado === "visibles") filter.oculto = false;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("autor", "alias nombre avatar"),
      Post.countDocuments(filter),
    ]);

    const [totalVisibles, totalOcultas] = await Promise.all([
      Post.countDocuments({ eliminado: false, oculto: false }),
      Post.countDocuments({ eliminado: false, oculto: true }),
    ]);

    return res.json({
      ok: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: { visibles: totalVisibles, ocultas: totalOcultas },
    });
  } catch (err) { next(err); }
};

/**
 * Oculta una publicación y notifica al autor por email.
 * @route PATCH /admin/posts/:id/hide
 */
export const hidePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, eliminado: false },
      { oculto: true },
      { new: true }
    ).populate("autor", "alias nombre email");

    if (!post) return res.status(404).json({ ok: false, message: "Post no encontrado" });

    if (post.autor?.email) {
      sendPostHiddenEmail({
        to: post.autor.email,
        nombre: post.autor.nombre,
        contenido: post.contenido,
      }).catch(logger.error);
    }
    
    return res.json({ ok: true, post });
  } catch (err) { next(err); }
};

/**
 * Restaura la visibilidad de una publicación y notifica al autor por email.
 * @route PATCH /admin/posts/:id/restore
 */
export const restorePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, eliminado: false },
      { oculto: false },
      { new: true }
    ).populate("autor", "alias nombre email");

    if (!post) return res.status(404).json({ ok: false, message: "Post no encontrado" });

    if (post.autor?.email) {
      sendPostRestoredEmail({
        to: post.autor.email,
        nombre: post.autor.nombre,
        contenido: post.contenido,
      }).catch(logger.error);
    }

    return res.json({ ok: true, post });
  } catch (err) { next(err); }
};

/**
 * Elimina lógicamente una publicación marcándola como eliminada y oculta.
 * @route DELETE /admin/posts/:id
 */
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { eliminado: true, oculto: true },
      { new: true }
    );

    if (!post) return res.status(404).json({ ok: false, message: "Post no encontrado" });

    return res.json({ ok: true, message: "Post eliminado" });
  } catch (err) { next(err); }
};

// ── USUARIOS ──────────────────────────────────────────────────────────────────

/**
 * Devuelve los usuarios paginados para administración, pudiéndolos filtrar por nombre, alias,
 * email y estado. Incluye estadísticas del total de usuarios activos y bloqueados.
 * @route GET /admin/users
 */
export const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.q) {
      filter.$or = [
        { alias: { $regex: req.query.q, $options: "i" } },
        { nombre: { $regex: req.query.q, $options: "i" } },
        { email: { $regex: req.query.q, $options: "i" } },
      ];
    }
    if (req.query.estado === "bloqueados") filter.bloqueado = true;
    else if (req.query.estado === "activos") filter.bloqueado = false;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("alias nombre email avatar rol bloqueado createdAt"),
      User.countDocuments(filter),
    ]);

    const [totalActivos, totalBloqueados] = await Promise.all([
      User.countDocuments({ bloqueado: false }),
      User.countDocuments({ bloqueado: true }),
    ]);

    return res.json({
      ok: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: { activos: totalActivos, bloqueados: totalBloqueados },
    });
  } catch (err) { next(err); }
};

/**
 * Bloquea una cuenta de usuario y le notifica por email.
 * No permite que un administrador se bloquee a sí mismo.
 * @route PATCH /admin/users/:id/block
 */
export const blockUser = async (req, res, next) => {
  try {
    // ── Primero comprobar, luego actualizar ──
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ ok: false, message: "No puedes bloquearte a ti mismo" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { bloqueado: true },
      { returnDocument: "after" }
    ).select("alias nombre email bloqueado");

    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });

    if (user.email && typeof sendUserBlockedEmail === 'function') {
      sendUserBlockedEmail({
        to: user.email,
        nombre: user.nombre,
        motivo: req.body?.motivo ?? "No especificado",
      }).catch(err => {
        logger.error("Error al enviar email de bloqueo:", err);
      });
    } else {
      logger.warn("No se pudo enviar el email: Función no definida o usuario sin correo.");
    }

    return res.json({ ok: true, user });
  } catch (err) { next(err); }
};

/**
 * Desbloquea una cuenta de usuario y le notifica por email.
 * @route PATCH /admin/users/:id/unblock
 */
export const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { bloqueado: false },
      { new: true }
    ).select("alias nombre email bloqueado");

    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });

    if (user.email) {
      sendUserUnblockedEmail({
        to: user.email,
        nombre: user.nombre,
      }).catch(logger.error);
    }

    return res.json({ ok: true, user });
  } catch (err) { next(err); }
};

// ── EVENTOS ───────────────────────────────────────────────────────────────────

/**
 * Devuelve los eventos paginados para moderación, filtrables por título y estado.
 * Incluye estadísticas del total de eventos visibles y ocultos.
 * @route GET /admin/events
 */
export const listEvents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.q) filter.title = { $regex: req.query.q, $options: "i" };
    if (req.query.estado === "ocultos") filter.oculto = true;
    else if (req.query.estado === "visibles") filter.oculto = false;

    const [events, total] = await Promise.all([
      Event.find(filter).sort({ startDate: -1 }).skip(skip).limit(limit),
      Event.countDocuments(filter),
    ]);

    const [totalVisibles, totalOcultos] = await Promise.all([
      Event.countDocuments({ oculto: false }),
      Event.countDocuments({ oculto: true }),
    ]);

    return res.json({
      ok: true,
      events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: { visibles: totalVisibles, ocultos: totalOcultos },
    });
  } catch (err) { next(err); }
};

/**
 * Oculta un evento de la plataforma.
 * @route PATCH /admin/events/:id/hide
 */
export const hideEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { oculto: true },
      { new: true }
    );

    if (!event) return res.status(404).json({ ok: false, message: "Evento no encontrado" });

    return res.json({ ok: true, event });
  } catch (err) { next(err); }
};

/**
 * Restaura la visibilidad de un evento.
 * @route PATCH /admin/events/:id/restore
 */
export const restoreEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { oculto: false },
      { new: true }
    );

    if (!event) return res.status(404).json({ ok: false, message: "Evento no encontrado" });

    return res.json({ ok: true, event });
  } catch (err) { next(err); }
};