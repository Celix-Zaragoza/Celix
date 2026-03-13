import { Conversation } from "../models/Conversation.js";

export const loadConversation = async (req, res, next) => {
    if (req.body.conversationId) res.status(400).json({ ok: false, message: 'No se ha encontrado el id de la conversación!!!'})
    const conversationId = req.body.conversationId

    const conversation = await new Promise(() => {
        Conversation.find({ conversacion: conversationId })
        .sort({ createdAt: -1 })
    })

    res.locals.conversation = conversation
    next()
}