/**
 * @file conversations.controller.test.js
 * @description Tests unitarios del controlador de conversaciones.
 * Comprueba el listado paginado, consulta de mensajes, envío de mensajes
 * y creación o recuperación de conversaciones entre usuarios.
 */

import { jest } from "@jest/globals";

const conversationFindMock = jest.fn();
const conversationCountDocumentsMock = jest.fn();
const conversationFindOneMock = jest.fn();
const conversationFindByIdMock = jest.fn();
const conversationCreateMock = jest.fn();
const messageFindMock = jest.fn();
const messageCountDocumentsMock = jest.fn();
const messageCreateMock = jest.fn();

jest.unstable_mockModule("../../models/Conversation.js", () => ({
  Conversation: {
    find: conversationFindMock,
    countDocuments: conversationCountDocumentsMock,
    findOne: conversationFindOneMock,
    findById: conversationFindByIdMock,
    create: conversationCreateMock,
  },
  Message: {
    find: messageFindMock,
    countDocuments: messageCountDocumentsMock,
    create: messageCreateMock,
  },
}));

const {
  listConversations,
  listConversationMessages,
  sendConversationMessage,
  createOrGetConversation,
} = await import("../../controllers/conversations.controller.js");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("controlador de conversaciones", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listConversations devuelve conversaciones paginadas", async () => {
    const req = { query: {}, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    conversationFindMock.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([{ _id: "c-1" }]),
    });
    conversationCountDocumentsMock.mockResolvedValue(1);

    await listConversations(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, conversations: [{ _id: "c-1" }] }));
  });

  test("listConversationMessages devuelve 400 si la conversacion no existe", async () => {
    const req = { params: { conversationId: "c-404" }, query: {} };
    const res = createRes();
    const next = jest.fn();

    conversationFindOneMock.mockResolvedValue(null);

    await listConversationMessages(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("sendConversationMessage crea mensaje y actualiza no leidos", async () => {
    const req = { params: { conversationId: "c-1" }, body: { contenido: "hola" }, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    const conversation = {
      participantes: [{ toString: () => "u-1" }, { toString: () => "u-2" }],
      noLeidos: new Map(),
      save: jest.fn().mockResolvedValue(undefined),
    };

    conversationFindByIdMock.mockReturnValue({ select: jest.fn().mockResolvedValue(conversation) });
    messageCreateMock.mockResolvedValue({ createdAt: new Date("2026-03-27"), _id: "m-1" });

    await sendConversationMessage(req, res, next);

    expect(conversation.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });

  test("createOrGetConversation crea la conversacion cuando no existe", async () => {
    const req = { body: { participanteId: "u-2" }, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    conversationFindOneMock.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    conversationCreateMock.mockResolvedValue({
      populate: jest.fn().mockResolvedValue({ _id: "c-new", participantes: ["u-1", "u-2"] }),
    });

    await createOrGetConversation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });
});
