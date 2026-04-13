import { Post, User } from "../models/index.js";
import { analizarPostConIA} from "../services/geminiService.js";

/** Añade al post si el usuario autenticado ya dio like */
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

// ── GET /posts  (feed global paginado) ────────────────────────────────────────

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

// ── GET /posts/following  (feed de usuarios seguidos) ─────────────────────────

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

// ── POST /posts ───────────────────────────────────────────────────────────────


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

    const infoDeporte = req.user.deportesNivel?.find(d => 
      d.deporte.toLowerCase() === deporte.toLowerCase()
    );
    const nivelActual = infoDeporte ? infoDeporte.nivel : 3; // 3 por defecto si no lo tiene en su perfil
    
    await post.populate("autor", "alias nombre avatar zona");

    res.status(201).json({ ok: true, post: postPublic(post, req.user._id) });

    procesarPostEnSegundoPlano(post._id, contenido, deporte, nivelActual).catch(err =>
      console.error("Error silencioso en background:", err)
    );
  } catch (err) {
    next(err);
  }
};

// Función helper para ejecutar la IA de fondo
async function procesarPostEnSegundoPlano(postId, contenido, deporte, nivelUsuario) {
  console.log('[IA] Iniciando análisis para post: ${postId}');
  const etiquetas = await analizarPostConIA(contenido, deporte, nivelUsuario);
  
  if (etiquetas) {
    await Post.findByIdAndUpdate(postId, {
      ia_tags: {
        deporte_principal: etiquetas.deporte_principal,
        nivel_recomendado: etiquetas.nivel_recomendado,
        keywords: etiquetas.keywords,
        analizado: true
      }
    });
    console.log(`[IA] Post ${postId} analizado correctamente.`);
  } else {
    console.log(`[IA] Fallo en el análisis para el post ${postId}`);
  }
}

// ── DELETE /posts/:id ─────────────────────────────────────────────────────────

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

// ── POST /posts/:id/like ──────────────────────────────────────────────────────

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

// ── DELETE /posts/:id/like ────────────────────────────────────────────────────

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

// ── GET /posts/user/:id  (posts de un usuario concreto) ───────────────────────

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