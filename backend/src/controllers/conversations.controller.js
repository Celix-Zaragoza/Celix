/**
 * @file conversations.controller.js
 * @description Controlador de conversaciones y mensajes privados entre usuarios.
 * Gestiona el listado de conversaciones, mensajes, envío y creación de conversaciones.
 */

import { Conversation, Message } from "../models/Conversation.js";

/**
 * Devuelve las conversaciones paginadas del usuario autenticado, ordenadas por actividad reciente.
 * @route GET /conversations
 */
export const listConversations = async (req, res, next) => {
  
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = { participantes: req.user._id };

    try {
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
      }
    );
  } catch (err) {
    return next(err);
  }
};

/**
 * Devuelve los mensajes de una conversación, ordenados del más reciente al más antiguo.
 * @route GET /conversations/:conversationId/messages
 */
export const listConversationMessages = async (req, res, next) => {
  
  const { conversationId } = req.params; 
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
  
  const existing = await Conversation.findOne()
  if (!existing) return res.status(400).json({ ok: false, message:`No se ha encontrado una conversación con el id: ${conversationId}`})

  try {
    const filter = { conversacion: conversationId };
    const [messages, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("remitente", "nombre alias avatar"),
      Message.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      messages,
      pagination: { limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Envía un mensaje en una conversación y actualiza el contador de no leídos de cada participante.
 * @route POST /conversations/:conversationId/messages
 */
export const sendConversationMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { contenido } = req.body;

    const conversation = await Conversation.findById(conversationId).select("_id participantes noLeidos");
    if (!conversation) {
      return res.status(404).json({ ok: false, message: "Conversation not found" });
    }

    const message = await Message.create({
      conversacion: conversationId,
      remitente: req.user._id,
      contenido,
      leido: false,
    });

    const senderId = req.user._id.toString();
    const unreadMap = conversation.noLeidos ?? new Map();

    conversation.participantes.forEach((participantId) => {
      const participantKey = participantId.toString();
      if (participantKey === senderId) {
        unreadMap.set(participantKey, 0);
      } else {
        unreadMap.set(participantKey, (unreadMap.get(participantKey) ?? 0) + 1);
      }
    });

    conversation.noLeidos = unreadMap;
    conversation.ultimoMensaje = contenido.slice(0, 200);
    conversation.ultimaFecha = message.createdAt;
    await conversation.save();

    return res.status(201).json({
      ok: true,
      message,
    });

  } catch (err) {
    return next(err);
  }
};

/**
 * Devuelve una conversación existente entre dos usuarios o la crea si no existe.
 * @route POST /conversations
 */
export const createOrGetConversation = async (req, res, next) => {
  try {
    const { participanteId } = req.body;
    const myId = req.user._id;

    if (participanteId === myId.toString()) {
      return res.status(400).json({ ok: false, message: "No puedes iniciar una conversación contigo mismo" });
    }

    // Buscar si ya existe
    const existing = await Conversation.findOne({
      participantes: { $all: [myId, participanteId], $size: 2 },
    }).populate("participantes", "nombre alias avatar");

    if (existing) {
      return res.json({ ok: true, conversation: existing });
    }

    // Crear nueva
    const conversation = await Conversation.create({
      participantes: [myId, participanteId],
    });
    const populated = await conversation.populate("participantes", "nombre alias avatar");

    return res.status(201).json({ ok: true, conversation: populated });
  } catch (err) {
    return next(err);
  }
};
