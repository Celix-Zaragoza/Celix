/**
 * @file posts.controller.js
 * @description Controlador de publicaciones. Gestiona los feeds, creación,
 * eliminación, likes y el feed personalizado con reordenación por IA.
 */

import { logger } from "../config/logger.js";
import { Post, User } from "../models/index.js";
import { reordenarFeedConIA} from "../services/geminiService.js";

/**
 * Añade al post si el usuario autenticado ya dio like y el número total de likes.
 * @param {object} post - Documento de post de Mongoose.
 * @param {string|object} userId - ID del usuario autenticado.
 * @returns {object} Post con los campos hasLiked y numLikes añadidos.
 */
function postPublic(post, userId) {
  const obj = post.toJSON ? post.toJSON() : post;
  return {
    ...obj,
    hasLiked: userId
      ? post.likes?.some((id) => id.toString() === userId.toString())
      : false,
    numLikes: post.likes?.length ?? 0,
  };
}

/**
 * Devuelve el feed global paginado, filtrable por deporte.
 * @route GET /posts
 */
export const getPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { oculto: false, eliminado: false };
    if (req.query.deporte) filter.deporte = req.query.deporte;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("autor", "alias nombre avatar zona"),
      Post.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      posts: posts.map((p) => postPublic(p, req.user._id)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Devuelve el feed paginado de publicaciones de los usuarios que sigue el usuario autenticado.
 * @route GET /posts/following
 */
export const getFollowingFeed = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const me = await User.findById(req.user._id).select("siguiendo");
    const autorIds = me.siguiendo ?? [];

    const filter = { autor: { $in: autorIds }, oculto: false, eliminado: false };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("autor", "alias nombre avatar zona"),
      Post.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      posts: posts.map((p) => postPublic(p, req.user._id)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Crea una nueva publicación para el usuario autenticado.
 * @route POST /posts
 */
export const createPost = async (req, res, next) => {
  try {
    const { contenido, deporte, ubicacion, tipo, imagen } = req.body;
    
    const post = await Post.create({
      autor: req.user._id,
      contenido,
      deporte,
      ubicacion,
      tipo,
      imagen: imagen || null,
    });

    await post.populate("autor", "alias nombre avatar zona");

    res.status(201).json({ ok: true, post: postPublic(post, req.user._id) });

  } catch (err) {
    next(err);
  }
};

// Caché en memoria del feed personalizado por usuario (TTL de 5 minutos)
const cacheFeedIA = new Map();

/**
 * Devuelve el feed personalizado "Para ti" reordenado por IA según los intereses
 * deportivos del usuario. Usa caché en memoria con TTL de 5 minutos para
 * reducir llamadas a la API de Gemini. Si la IA falla, devuelve orden cronológico.
 * @route GET /posts/para-ti
 */
export const getParaTiFeed = async (req, res, next) => {
  try {
    
    const userId = req.user._id.toString();
    const ahora = Date.now();

    // ¿Tenemos este feed en caché y es reciente (menos de 5 min)?
    if (cacheFeedIA.has(userId)) {
      const { posts, timestamp } = cacheFeedIA.get(userId);
      if (ahora - timestamp < 5 * 60 * 1000) {
        logger.info("[IA Feed] Sirviendo desde Caché (Ahorrando API)");
        return res.json({ ok: true, posts, source: "cache" });
      }
    }
    // Traemos una cantidad mayor de posts candidatos (ej. los últimos 40)
    // Filtramos los que no estén eliminados u ocultos
    const postsCandidatos = await Post.find({ oculto: false, eliminado: false })
      .sort({ createdAt: -1 })
      .limit(40)
      .populate("autor", "alias nombre avatar zona");

    logger.info(` [IA Feed] Posts candidatos encontrados: ${postsCandidatos.length}`);

    // Extraemos los intereses del usuario (deportes y niveles)
    const misIntereses = req.user.deportesNivel.map(d => ({
      deporte: d.deporte,
      nivel: d.nivel
    }));

    logger.info(` [IA Feed] Intereses del usuario:`, JSON.stringify(misIntereses));

    // Pedimos a Gemini que los ordene según afinidad real
    const ordenIds = await reordenarFeedConIA(misIntereses, postsCandidatos);

    let postsFinales;
    if (ordenIds && Array.isArray(ordenIds)) {
      logger.info(` [IA Feed] Gemini ha devuelto un orden de ${ordenIds.length} IDs`);
      // Reordenamos nuestro array original basándonos en el orden de IDs que dictó la IA
      postsFinales = ordenIds
        .map(id => postsCandidatos.find(p => p._id.toString() === id))
        .filter(p => p !== undefined); // Por si acaso algún ID no coincide
    } else {
      logger.warn(`[IA Feed] Gemini falló. Usando orden cronológico por defecto.`);
      // Si la IA falla, devolvemos el orden por fecha como fallback
      postsFinales = postsCandidatos;
    }

    // Paginación manual sobre el resultado ordenado por la IA
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const paginados = postsFinales.slice((page - 1) * limit, page * limit);

    // Guardamos en caché
    const postsResponse = postsFinales.map(p => postPublic(p, req.user._id));
    cacheFeedIA.set(userId, { 
      posts: postsResponse, 
      timestamp: ahora 
    });

    return res.json({
      ok: true,
      posts: paginados.map((p) => postPublic(p, req.user._id)),
      totalEnFeed: postsFinales.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Elimina lógicamente una publicación (marca eliminado=true). Solo el autor puede eliminarla.
 * @route DELETE /posts/:id
 */
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.eliminado) {
      return res.status(404).json({ ok: false, message: "Post no encontrado" });
    }
    if (post.autor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ ok: false, message: "No puedes eliminar este post" });
    }

    // Eliminación lógica (RF-13)
    post.eliminado = true;
    await post.save();

    return res.json({ ok: true, message: "Post eliminado" });
  } catch (err) {
    next(err);
  }
};

/**
 * Añade un like del usuario autenticado a una publicación.
 * @route POST /posts/:id/like
 */
export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, oculto: false, eliminado: false });
    if (!post) return res.status(404).json({ ok: false, message: "Post no encontrado" });

    const yaLeDioLike = post.likes.some((id) => id.toString() === req.user._id.toString());
    if (yaLeDioLike) {
      return res.status(400).json({ ok: false, message: "Ya has dado like a este post" });
    }

    post.likes.push(req.user._id);
    await post.save();

    return res.json({ ok: true, numLikes: post.likes.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Elimina el like del usuario autenticado de una publicación.
 * @route DELETE /posts/:id/like
 */
export const unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, oculto: false, eliminado: false });
    if (!post) return res.status(404).json({ ok: false, message: "Post no encontrado" });

    post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    await post.save();

    return res.json({ ok: true, numLikes: post.likes.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Devuelve las publicaciones paginadas de un usuario concreto.
 * @route GET /posts/user/:id
 */
export const getPostsByUser = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { autor: req.params.id, oculto: false, eliminado: false };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("autor", "alias nombre avatar zona"),
      Post.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      posts: posts.map((p) => postPublic(p, req.user._id)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};