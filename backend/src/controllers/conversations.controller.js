import { Conversation, Message } from "../models/Conversation.js";
import { notImplemented } from "./_helpers.js";

export const listConversations = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "User not authenticated" });
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = { participantes: req.user._id };
    const [conversations, total] = await Promise.all([
      Conversation.find(filter)
        .sort({ ultimaFecha: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("participantes", "nombre alias avatar"),
      Conversation.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      conversations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return next(err);
  }
};

export const listConversationMessages = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "User not authenticated" });
    }

    const { conversationId } = req.params;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(conversationId).select("_id participantes");
    if (!conversation) {
      return res.status(404).json({ ok: false, message: "Conversation not found" });
    }

    const isParticipant = conversation.participantes.some(
      (participantId) => participantId.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    const filter = { conversacion: conversationId };
    const [messages, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("remitente", "nombre alias avatar"),
      Message.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return next(err);
  }
};

export const sendConversationMessage = async (req, res) => {
  return notImplemented(res, "send conversation message", {
    contenido: "string",
  });
};