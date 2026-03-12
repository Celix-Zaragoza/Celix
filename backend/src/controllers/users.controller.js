import { User } from "../models/index.js";

/** Formato público de usuario (sin datos sensibles) */
function userPublic(user, currentUserId) {
  return {
    id: user._id,
    nombre: user.nombre,
    alias: user.alias,
    zona: user.zona,
    deportesNivel: user.deportesNivel,
    nivelGeneral: user.nivelGeneral,
    bio: user.bio,
    avatar: user.avatar,
    rol: user.rol,
    perfilCompleto: user.perfilCompleto,
    numSeguidores: user.seguidores?.length ?? 0,
    numSiguiendo: user.siguiendo?.length ?? 0,
    // ¿El usuario autenticado ya le sigue?
    siguiendo: currentUserId
      ? user.seguidores?.some((id) => id.toString() === currentUserId.toString())
      : false,
    createdAt: user.createdAt,
  };
}

// ── GET /users/me ─────────────────────────────────────────────────────────────

export const getMe = (req, res) => {
  return res.json({ ok: true, user: userPublic(req.user, req.user._id) });
};

// ── PATCH /users/me ───────────────────────────────────────────────────────────


export const updateMe = async (req, res, next) => {
  try {
    const { nombre, alias, edad, zona, bio, avatar, deportesNivel, nivelGeneral } = req.body;

    // Si cambia el alias, verificar que no esté en uso
    if (alias && alias !== req.user.alias) {
      const exists = await User.findOne({ alias, _id: { $ne: req.user._id } });
      if (exists) {
        return res.status(409).json({ ok: false, message: "El alias ya está en uso" });
      }
    }

    const campos = { nombre, alias, edad, zona, bio, avatar, deportesNivel, nivelGeneral };
    // Eliminar los undefined para no machacar campos no enviados
    Object.keys(campos).forEach((k) => campos[k] === undefined && delete campos[k]);

    // Marcar perfilCompleto si ya tiene todos los datos obligatorios
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...campos,
        perfilCompleto: !!(
          (campos.edad ?? req.user.edad) &&
          (campos.zona ?? req.user.zona) &&
          ((campos.deportesNivel ?? req.user.deportesNivel)?.length > 0)
        ),
      },
      { new: true, runValidators: true }
    );

    return res.json({ ok: true, user: userPublic(updated, updated._id) });
  } catch (err) {
    next(err);
  }
};

// ── GET /users/:id ────────────────────────────────────────────────────────────

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    return res.json({ ok: true, user: userPublic(user, req.user._id) });
  } catch (err) {
    next(err);
  }
};

// ── POST /users/:id/follow ────────────────────────────────────────────────────

export const followUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const meId = req.user._id;

    if (targetId === meId.toString()) {
      return res.status(400).json({ ok: false, message: "No puedes seguirte a ti mismo" });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });

    const yaLeSigue = target.seguidores.some((id) => id.toString() === meId.toString());
    if (yaLeSigue) {
      return res.status(400).json({ ok: false, message: "Ya sigues a este usuario" });
    }

    // Actualización bidireccional: añadir a siguiendo y seguidores
    await User.findByIdAndUpdate(meId, { $addToSet: { siguiendo: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { seguidores: meId } });

    return res.json({ ok: true, message: "Ahora sigues a este usuario" });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /users/:id/follow ──────────────────────────────────────────────────

export const unfollowUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const meId = req.user._id;

    await User.findByIdAndUpdate(meId, { $pull: { siguiendo: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { seguidores: meId } });

    return res.json({ ok: true, message: "Has dejado de seguir a este usuario" });
  } catch (err) {
    next(err);
  }
};

// ── GET /users/:id/followers ──────────────────────────────────────────────────

export const getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("seguidores", "alias nombre avatar zona deportesNivel nivelGeneral");
    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    return res.json({ ok: true, seguidores: user.seguidores });
  } catch (err) {
    next(err);
  }
};

// ── GET /users/:id/following ──────────────────────────────────────────────────

export const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("siguiendo", "alias nombre avatar zona deportesNivel nivelGeneral");
    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    return res.json({ ok: true, siguiendo: user.siguiendo });
  } catch (err) {
    next(err);
  }
};

// ── GET /users/search?q= ──────────────────────────────────────────────────────

export const searchUsers = async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json({ ok: true, users: [] });

    const users = await User.find({
      $or: [
        { alias: { $regex: q, $options: "i" } },
        { nombre: { $regex: q, $options: "i" } },
      ],
      bloqueado: false,
      _id: { $ne: req.user._id }, // no aparece uno mismo
    })
      .select("alias nombre avatar zona deportesNivel nivelGeneral seguidores")
      .limit(20);

    return res.json({
      ok: true,
      users: users.map((u) => userPublic(u, req.user._id)),
    });
  } catch (err) {
    next(err);
  }
};