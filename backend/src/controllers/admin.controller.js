// backend/src/controllers/admin.controller.js
import { Post, User } from "../models/index.js";
import { Event } from "../models/Event.js";

// ── PUBLICACIONES ─────────────────────────────────────────────────────────────

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

    return res.json({
      ok: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

export const hidePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, eliminado: false },
      { oculto: true },
      { new: true }
    ).populate("autor", "alias nombre email");

    if (!post) return res.status(404).json({ ok: false, message: "Post no encontrado" });

    return res.json({ ok: true, post });
  } catch (err) { next(err); }
};

export const restorePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, eliminado: false },
      { oculto: false },
      { new: true }
    ).populate("autor", "alias nombre email");

    if (!post) return res.status(404).json({ ok: false, message: "Post no encontrado" });

    return res.json({ ok: true, post });
  } catch (err) { next(err); }
};

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

    return res.json({
      ok: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

export const blockUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { bloqueado: true },
      { new: true }
    ).select("alias nombre email bloqueado");

    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ ok: false, message: "No puedes bloquearte a ti mismo" });
    }

    return res.json({ ok: true, user });
  } catch (err) { next(err); }
};

export const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { bloqueado: false },
      { new: true }
    ).select("alias nombre email bloqueado");

    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });

    return res.json({ ok: true, user });
  } catch (err) { next(err); }
};

// ── EVENTOS ───────────────────────────────────────────────────────────────────

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

    return res.json({
      ok: true,
      events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

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