/**
 * @file users.controller.test.js
 * @description Tests unitarios del controlador de usuarios.
 * Comprueba la actualización de perfil, consulta de perfiles, seguimiento
 * entre usuarios, listado de seguidores/seguidos y búsqueda de usuarios.
 */

import { jest } from "@jest/globals";

const userFindOneMock = jest.fn();
const userFindByIdMock = jest.fn();
const userFindByIdAndUpdateMock = jest.fn();
const userFindMock = jest.fn();

jest.unstable_mockModule("../../models/index.js", () => ({
  User: {
    findOne: userFindOneMock,
    findById: userFindByIdMock,
    findByIdAndUpdate: userFindByIdAndUpdateMock,
    find: userFindMock,
  },
  Post: {
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

const {
  updateMe,
  getUserById,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
} = await import("../../controllers/users.controller.js");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("controlador de usuarios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("updateMe devuelve 409 cuando el alias ya existe", async () => {
    const req = {
      body: { alias: "taken_alias" },
      user: { _id: "u-1", alias: "anon_a", edad: 22, zona: "Z1", deportesNivel: [] },
    };
    const res = createRes();
    const next = jest.fn();

    userFindOneMock.mockResolvedValue({ _id: "u-9" });

    await updateMe(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "El alias ya está en uso" });
  });

  test("updateMe actualiza usuario y recalcula perfilCompleto", async () => {
    const req = {
      body: { edad: 30, zona: "Z2", deportesNivel: [{ deporte: "D1", nivel: 3 }] },
      user: { _id: "u-1", alias: "anon_a", edad: null, zona: null, deportesNivel: [] },
    };
    const res = createRes();
    const next = jest.fn();

    userFindByIdAndUpdateMock.mockResolvedValue({
      _id: "u-1",
      nombre: "Anon A",
      alias: "anon_a",
      edad: 30,
      zona: "Z2",
      deportesNivel: [{ deporte: "D1", nivel: 3 }],
      nivelGeneral: 1,
      bio: "",
      avatar: null,
      rol: "USER",
      perfilCompleto: true,
      seguidores: [],
      siguiendo: [],
      createdAt: "2026-03-27",
    });

    await updateMe(req, res, next);

    expect(userFindByIdAndUpdateMock).toHaveBeenCalledWith(
      "u-1",
      expect.objectContaining({ perfilCompleto: true }),
      { new: true, runValidators: true }
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
    expect(next).not.toHaveBeenCalled();
  });

  test("getUserById devuelve 404 si el usuario no existe", async () => {
    const req = { params: { id: "missing" }, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    userFindByIdMock.mockResolvedValue(null);

    await getUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Usuario no encontrado" });
  });

  test("followUser sigue al usuario objetivo", async () => {
    const req = { params: { id: "u-2" }, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    userFindByIdMock.mockResolvedValue({ _id: "u-2", seguidores: [] });

    await followUser(req, res, next);

    expect(userFindByIdAndUpdateMock).toHaveBeenNthCalledWith(1, "u-1", { $addToSet: { siguiendo: "u-2" } });
    expect(userFindByIdAndUpdateMock).toHaveBeenNthCalledWith(2, "u-2", { $addToSet: { seguidores: "u-1" } });
    expect(res.json).toHaveBeenCalledWith({ ok: true, message: "Ahora sigues a este usuario" });
  });

  test("unfollowUser elimina la relacion de seguimiento", async () => {
    const req = { params: { id: "u-2" }, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    await unfollowUser(req, res, next);

    expect(userFindByIdAndUpdateMock).toHaveBeenNthCalledWith(1, "u-1", { $pull: { siguiendo: "u-2" } });
    expect(userFindByIdAndUpdateMock).toHaveBeenNthCalledWith(2, "u-2", { $pull: { seguidores: "u-1" } });
    expect(res.json).toHaveBeenCalledWith({ ok: true, message: "Has dejado de seguir a este usuario" });
  });

  test("getFollowers devuelve seguidores poblados", async () => {
    const req = { params: { id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    userFindByIdMock.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ seguidores: [{ _id: "u-2" }] }),
    });

    await getFollowers(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ ok: true, seguidores: [{ _id: "u-2" }] });
  });

  test("getFollowing devuelve seguidos poblados", async () => {
    const req = { params: { id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    userFindByIdMock.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ siguiendo: [{ _id: "u-3" }] }),
    });

    await getFollowing(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ ok: true, siguiendo: [{ _id: "u-3" }] });
  });

  test("searchUsers devuelve vacio cuando no hay query", async () => {
    const req = { query: {}, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    await searchUsers(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ ok: true, users: [] });
    expect(userFindMock).not.toHaveBeenCalled();
  });

  test("searchUsers devuelve usuarios mapeados en formato publico", async () => {
    const req = { query: { q: "  an  " }, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    userFindMock.mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([
          {
            _id: "u-2",
            nombre: "Anon B",
            alias: "anon_b",
            edad: 20,
            zona: "Z1",
            deportesNivel: [],
            nivelGeneral: 1,
            bio: "",
            avatar: null,
            rol: "USER",
            perfilCompleto: false,
            seguidores: ["u-1"],
            siguiendo: [],
            createdAt: "2026-03-27",
          },
        ]),
      }),
    });

    await searchUsers(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        users: [expect.objectContaining({ id: "u-2", siguiendo: true })],
      })
    );
  });
});
