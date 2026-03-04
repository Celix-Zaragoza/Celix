import { notImplemented } from "./_helpers.js";

export const listConversations = async (req, res) => {
  return notImplemented(res, "list conversations", null);
};

export const listConversationMessages = async (req, res) => {
  return notImplemented(res, "list conversation messages", null);
};

export const sendConversationMessage = async (req, res) => {
  return notImplemented(res, "send conversation message", {
    contenido: "string",
  });
};