// backend/src/routes/v1/conversations.routes.js
import { Router } from "express";
import {
  listConversations,
  listConversationMessages,
  sendConversationMessage,
  createOrGetConversation,
} from "../../controllers/conversations.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import {
  conversationParamsSchema,
  sendMessageSchema,
  createConversationSchema,
} from "../../schemas/conversations.schema.js";

const router = Router();

router.get("/", requireAuth, listConversations);
router.post("/", requireAuth, validateBody(createConversationSchema), createOrGetConversation);
router.get("/:conversationId/messages", requireAuth, validateParams(conversationParamsSchema), listConversationMessages);
router.post(
  "/:conversationId/messages",
  requireAuth,
  validateParams(conversationParamsSchema),
  validateBody(sendMessageSchema),
  sendConversationMessage
);

export default router;