import { jest } from "@jest/globals";

const postFindMock = jest.fn();
const postCountDocumentsMock = jest.fn();
const postFindOneAndUpdateMock = jest.fn();
const userFindMock = jest.fn();
const userCountDocumentsMock = jest.fn();
const userFindByIdAndUpdateMock = jest.fn();
const eventFindMock = jest.fn();
const eventCountDocumentsMock = jest.fn();
const eventFindByIdAndUpdateMock = jest.fn();

jest.unstable_mockModule("../../models/index.js", () => ({
  Post: {
    find: postFindMock,
    countDocuments: postCountDocumentsMock,
    findOneAndUpdate: postFindOneAndUpdateMock,
  },
  User: {
    find: userFindMock,
    countDocuments: userCountDocumentsMock,
    findByIdAndUpdate: userFindByIdAndUpdateMock,
  },
}));

jest.unstable_mockModule("../../models/Event.js", () => ({
  Event: {
    find: eventFindMock,
    countDocuments: eventCountDocumentsMock,
    findByIdAndUpdate: eventFindByIdAndUpdateMock,
  },
}));

const {
  listPosts,
  hidePost,
  deletePost,
  listUsers,
  blockUser,
  unblockUser,
  listEvents,
  hideEvent,
} = await import("../../controllers/admin.controller.js");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

function chain(result) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockResolvedValue(result),
    select: jest.fn().mockResolvedValue(result),
  };
}

describe("controlador de administración", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listPosts devuelve publicaciones paginadas", async () => {
    const req = { query: {}, user: { _id: "u-admin" } };
    const res = createRes();
    const next = jest.fn();

    postFindMock.mockReturnValue(chain([{ _id: "p-1" }]));
    postCountDocumentsMock.mockResolvedValue(1);

    await listPosts(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, posts: [{ _id: "p-1" }] }));
  });

  test("hidePost marca una publicacion como oculta", async () => {
    const req = { params: { id: "p-1" } };
    const res = createRes();
    const next = jest.fn();

    postFindOneAndUpdateMock.mockReturnValue({ populate: jest.fn().mockResolvedValue({ _id: "p-1", oculto: true }) });

    await hidePost(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ ok: true, post: { _id: "p-1", oculto: true } });
  });

  test("deletePost realiza borrado logico", async () => {
    const req = { params: { id: "p-1" } };
    const res = createRes();
    const next = jest.fn();

    postFindOneAndUpdateMock.mockResolvedValue({ _id: "p-1" });

    await deletePost(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ ok: true, message: "Post eliminado" });
  });

  test("listUsers devuelve usuarios paginados", async () => {
    const req = { query: {} };
    const res = createRes();
    const next = jest.fn();

    userFindMock.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue([{ _id: "u-1" }]),
    });
    userCountDocumentsMock.mockResolvedValue(1);

    await listUsers(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, users: [{ _id: "u-1" }] }));
  });

  test("blockUser bloquea un usuario", async () => {
    const req = { params: { id: "u-2" }, user: { _id: "u-admin" } };
    const res = createRes();
    const next = jest.fn();

    userFindByIdAndUpdateMock.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: "u-2", bloqueado: true }) });

    await blockUser(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ ok: true, user: { _id: "u-2", bloqueado: true } });
  });

  test("unblockUser desbloquea un usuario", async () => {
    const req = { params: { id: "u-2" } };
    const res = createRes();
    const next = jest.fn();

    userFindByIdAndUpdateMock.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: "u-2", bloqueado: false }) });

    await unblockUser(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ ok: true, user: { _id: "u-2", bloqueado: false } });
  });

  test("listEvents devuelve eventos paginados", async () => {
    const req = { query: {} };
    const res = createRes();
    const next = jest.fn();

    eventFindMock.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([{ _id: "e-1" }]),
    });
    eventCountDocumentsMock.mockResolvedValue(1);

    await listEvents(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, events: [{ _id: "e-1" }] }));
  });

  test("hideEvent marca un evento como oculto", async () => {
    const req = { params: { id: "e-1" } };
    const res = createRes();
    const next = jest.fn();

    eventFindByIdAndUpdateMock.mockResolvedValue({ _id: "e-1", oculto: true });

    await hideEvent(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ ok: true, event: { _id: "e-1", oculto: true } });
  });

  
});
