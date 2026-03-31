import { jest } from "@jest/globals";

const postFindMock = jest.fn();
const postCountDocumentsMock = jest.fn();
const postCreateMock = jest.fn();
const postFindByIdMock = jest.fn();
const postFindOneMock = jest.fn();
const userFindByIdMock = jest.fn();

jest.unstable_mockModule("../../models/index.js", () => ({
  Post: {
    find: postFindMock,
    countDocuments: postCountDocumentsMock,
    create: postCreateMock,
    findById: postFindByIdMock,
    findOne: postFindOneMock,
  },
  User: {
    findById: userFindByIdMock,
  },
}));

const {
  getPosts,
  getFollowingFeed,
  createPost,
  deletePost,
  likePost,
  unlikePost,
  getPostsByUser,
} = await import("../../controllers/posts.controller.js");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

function postQueryChain(result) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockResolvedValue(result),
  };
}

describe("controlador de publicaciones", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getPosts devuelve el feed paginado", async () => {
    const req = { query: {}, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    const posts = [{ _id: "p-1", likes: ["u-1"], toJSON: () => ({ _id: "p-1" }) }];
    postFindMock.mockReturnValue(postQueryChain(posts));
    postCountDocumentsMock.mockResolvedValue(1);

    await getPosts(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        posts: [expect.objectContaining({ _id: "p-1", hasLiked: true, numLikes: 1 })],
      })
    );
  });

  test("getFollowingFeed devuelve publicaciones de usuarios seguidos", async () => {
    const req = { query: {}, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    userFindByIdMock.mockReturnValue({ select: jest.fn().mockResolvedValue({ siguiendo: ["u-2"] }) });
    const posts = [{ _id: "p-2", likes: [], toJSON: () => ({ _id: "p-2" }) }];
    postFindMock.mockReturnValue(postQueryChain(posts));
    postCountDocumentsMock.mockResolvedValue(1);

    await getFollowingFeed(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, posts: expect.any(Array) }));
  });

  test("createPost crea y devuelve una nueva publicacion", async () => {
    const req = {
      user: { _id: "u-1" },
      body: { contenido: "txt", deporte: "D1", ubicacion: "Z1", tipo: "general", imagen: null },
    };
    const res = createRes();
    const next = jest.fn();

    const post = {
      _id: "p-3",
      likes: [],
      toJSON: () => ({ _id: "p-3" }),
      populate: jest.fn().mockResolvedValue(undefined),
    };
    postCreateMock.mockResolvedValue(post);

    await createPost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });

  test("deletePost devuelve 403 si no es el propietario", async () => {
    const req = { params: { id: "p-1" }, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    postFindByIdMock.mockResolvedValue({ _id: "p-1", eliminado: false, autor: { toString: () => "u-2" } });

    await deletePost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "No puedes eliminar este post" });
  });

  test("likePost agrega like cuando no existe previamente", async () => {
    const req = { params: { id: "p-1" }, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    const post = {
      likes: [],
      save: jest.fn().mockResolvedValue(undefined),
    };
    postFindOneMock.mockResolvedValue(post);

    await likePost(req, res, next);

    expect(post.likes).toEqual(["u-1"]);
    expect(res.json).toHaveBeenCalledWith({ ok: true, numLikes: 1 });
  });

  test("unlikePost elimina el like del usuario", async () => {
    const req = { params: { id: "p-1" }, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    const post = {
      likes: [{ toString: () => "u-1" }, { toString: () => "u-2" }],
      save: jest.fn().mockResolvedValue(undefined),
    };
    postFindOneMock.mockResolvedValue(post);

    await unlikePost(req, res, next);

    expect(post.likes).toHaveLength(1);
    expect(res.json).toHaveBeenCalledWith({ ok: true, numLikes: 1 });
  });

  test("getPostsByUser devuelve publicaciones del usuario", async () => {
    const req = { params: { id: "u-2" }, query: {}, user: { _id: "u-1" } };
    const res = createRes();
    const next = jest.fn();

    const posts = [{ _id: "p-4", likes: [], toJSON: () => ({ _id: "p-4" }) }];
    postFindMock.mockReturnValue(postQueryChain(posts));
    postCountDocumentsMock.mockResolvedValue(1);

    await getPostsByUser(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, posts: expect.any(Array) }));
  });
});
