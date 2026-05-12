/**
 * @file socket/index.js
 * @description Configuración e inicialización de Socket.io. Gestiona la autenticación
 * de conexiones y los eventos de mensajería en tiempo real entre usuarios.
 */
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Conversation, Message } from "../models/Conversation.js";
import { logger } from "../config/logger.js";

/**
 * Inicializa el servidor de Socket.io, configura el middleware de autenticación
 * y registra los eventos de conversación y mensajería en tiempo real.
 * @param httpServer - Servidor HTTP al que se adjunta Socket.io.
 * @returns Instancia de Socket.io.
 */
export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ── Middleware de autenticación ──────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id ?? payload._id ?? payload.sub;
      next();
    } catch {
      next(new Error("Token inválido"));
    }
  });

  // ── Conexión ─────────────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    logger.info(`🟢 Socket conectado: ${socket.userId}`);

    // El cliente se une a su sala personal (para recibir notificaciones)
    socket.join(`user:${socket.userId}`);

    // ── Unirse a una sala de conversación ──────────────────────────────────
    socket.on("join:conversation", async (conversationId) => {
      try {
        // Verificar que el usuario es participante
        const conv = await Conversation.findOne({
          _id: conversationId,
          participantes: socket.userId,
        });
        if (!conv) return socket.emit("error", "Conversación no encontrada");

        socket.join(`conv:${conversationId}`);
      } catch {
        socket.emit("error", "Error al unirse a la conversación");
      }
    });

    // ── Salir de una sala de conversación ──────────────────────────────────
    socket.on("leave:conversation", (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    // ── Enviar mensaje ─────────────────────────────────────────────────────
    socket.on("message:send", async ({ conversationId, contenido }) => {
      try {
        if (!contenido?.trim()) return;

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participantes: socket.userId,
        }).select("_id participantes noLeidos");

        if (!conversation) return socket.emit("error", "Conversación no encontrada");

        // Guardar mensaje en BD
        const message = await Message.create({
          conversacion: conversationId,
          remitente: socket.userId,
          contenido: contenido.trim(),
          leido: false,
        });

        await message.populate("remitente", "nombre alias avatar");

        // Actualizar la conversación
        const unreadMap = conversation.noLeidos ?? new Map();
        conversation.participantes.forEach((participantId) => {
          const key = participantId.toString();
          if (key === socket.userId) {
            unreadMap.set(key, 0);
          } else {
            unreadMap.set(key, (unreadMap.get(key) ?? 0) + 1);
          }
        });
        conversation.noLeidos = unreadMap;
        conversation.ultimoMensaje = contenido.trim().slice(0, 200);
        conversation.ultimaFecha = message.createdAt;
        await conversation.save();

        // Emitir el mensaje a todos los que están en la sala
        io.to(`conv:${conversationId}`).emit("message:new", message);

        // Notificar a los participantes que no están en la sala
        // (para actualizar el badge de no leídos en la lista)
        conversation.participantes.forEach((participantId) => {
          const key = participantId.toString();
          if (key !== socket.userId) {
            io.to(`user:${key}`).emit("conversation:updated", {
              conversationId,
              ultimoMensaje: conversation.ultimoMensaje,
              ultimaFecha: conversation.ultimaFecha,
              noLeidos: unreadMap.get(key) ?? 0,
            });
          }
        });
      } catch (err) {
        logger.error("Error en message:send:", err);
        socket.emit("error", "Error al enviar el mensaje");
      }
    });

    // ── Marcar conversación como leída ─────────────────────────────────────
    socket.on("conversation:read", async (conversationId) => {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participantes: socket.userId,
        });
        if (!conversation) return;

        const unreadMap = conversation.noLeidos ?? new Map();
        unreadMap.set(socket.userId, 0);
        conversation.noLeidos = unreadMap;
        await conversation.save();

        await Message.updateMany(
          { conversacion: conversationId, remitente: { $ne: socket.userId }, leido: false },
          { $set: { leido: true } }
        );
      } catch (err) {
        logger.error("Error en conversation:read:", err);
      }
    });

    // ── Desconexión ────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      logger.info(`🔴 Socket desconectado: ${socket.userId}`);
    });
  });

  return io;
}
