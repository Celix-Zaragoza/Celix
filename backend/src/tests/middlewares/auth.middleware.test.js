import { jest } from "@jest/globals";

const jwtVerifyMock = jest.fn();
const blacklistedTokenExistsMock = jest.fn();
const userFindByIdMock = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: jwtVerifyMock,
  },
}));

jest.unstable_mockModule("../../models/index.js", () => ({
  BlacklistedToken: {
    exists: blacklistedTokenExistsMock,
  },
  User: {
    findById: userFindByIdMock,
  },
}));

const { requireAuth, requireRole } = await import("../../middlewares/auth.middleware.js");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("middleware de autenticación", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  describe("requireAuth (autenticación requerida)", () => {
    test("devuelve 401 cuando falta el token", async () => {
      const req = { headers: {} };
      const res = createRes();
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Token no proporcionado" });
      expect(next).not.toHaveBeenCalled();
    });

    test("devuelve 401 cuando el token esta invalidado", async () => {
      const req = { headers: { authorization: "Bearer token-123" } };
      const res = createRes();
      const next = jest.fn();

      blacklistedTokenExistsMock.mockResolvedValue(true);

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Token invalidado" });
      expect(jwtVerifyMock).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test("devuelve 401 cuando el token ha expirado", async () => {
      const req = { headers: { authorization: "Bearer expired-token" } };
      const res = createRes();
      const next = jest.fn();

      blacklistedTokenExistsMock.mockResolvedValue(false);
      jwtVerifyMock.mockImplementation(() => {
        const err = new Error("expired");
        err.name = "TokenExpiredError";
        throw err;
      });

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Token expirado" });
      expect(next).not.toHaveBeenCalled();
    });

    test("devuelve 401 cuando el token es invalido", async () => {
      const req = { headers: { authorization: "Bearer malformed-token" } };
      const res = createRes();
      const next = jest.fn();

      blacklistedTokenExistsMock.mockResolvedValue(false);
      jwtVerifyMock.mockImplementation(() => {
        throw new Error("invalid");
      });

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Token inválido" });
      expect(next).not.toHaveBeenCalled();
    });

    test("devuelve 401 cuando no existe el usuario del token", async () => {
      const req = { headers: { authorization: "Bearer valid-token" } };
      const res = createRes();
      const next = jest.fn();

      blacklistedTokenExistsMock.mockResolvedValue(false);
      jwtVerifyMock.mockReturnValue({ sub: "u-404", exp: 1_900_000_000 });
      userFindByIdMock.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Usuario no encontrado" });
      expect(next).not.toHaveBeenCalled();
    });

    test("devuelve 403 cuando el usuario esta bloqueado", async () => {
      const req = { headers: { authorization: "Bearer valid-token" } };
      const res = createRes();
      const next = jest.fn();

      blacklistedTokenExistsMock.mockResolvedValue(false);
      jwtVerifyMock.mockReturnValue({ sub: "u-1", exp: 1_900_000_000 });
      userFindByIdMock.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "u-1", rol: "USER", bloqueado: true }),
      });

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Tu cuenta ha sido bloqueada" });
      expect(next).not.toHaveBeenCalled();
    });

    test("adjunta el usuario autenticado y llama a next cuando el token es valido", async () => {
      const req = { headers: { authorization: "Bearer valid-token" } };
      const res = createRes();
      const next = jest.fn();

      blacklistedTokenExistsMock.mockResolvedValue(false);
      jwtVerifyMock.mockReturnValue({ sub: "u-1", exp: 1_900_000_000 });

      const user = { _id: "u-1", rol: "USER", bloqueado: false };
      const selectMock = jest.fn().mockResolvedValue(user);
      userFindByIdMock.mockReturnValue({
        select: selectMock,
      });

      await requireAuth(req, res, next);

      expect(blacklistedTokenExistsMock).toHaveBeenCalledWith({ tokenHash: expect.any(String) });
      expect(jwtVerifyMock).toHaveBeenCalledWith("valid-token", "test-secret");
      expect(userFindByIdMock).toHaveBeenCalledWith("u-1");
      expect(selectMock).toHaveBeenCalledWith("-password");
      expect(req.user).toBe(user);
      expect(req.authTokenHash).toEqual(expect.any(String));
      expect(req.authTokenExpiration).toBeInstanceOf(Date);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("propaga errores inesperados con next", async () => {
      const req = { headers: { authorization: "Bearer valid-token" } };
      const res = createRes();
      const next = jest.fn();
      const dbError = new Error("db down");

      blacklistedTokenExistsMock.mockRejectedValue(dbError);

      await requireAuth(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
    });
  });

  describe("requireRole (roles permitidos)", () => {
    test("devuelve 401 cuando no hay usuario autenticado", () => {
      const middleware = requireRole("ADMIN");
      const req = {};
      const res = createRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "No autenticado" });
      expect(next).not.toHaveBeenCalled();
    });

    test("devuelve 403 cuando el rol no tiene permisos", () => {
      const middleware = requireRole("ADMIN");
      const req = { user: { rol: "USER" } };
      const res = createRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Sin permisos para esta acción" });
      expect(next).not.toHaveBeenCalled();
    });

    test("llama a next cuando el rol esta autorizado", () => {
      const middleware = requireRole("ADMIN", "USER");
      const req = { user: { rol: "USER" } };
      const res = createRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("cada middleware mantiene sus roles permitidos (closure)", () => {
      const soloAdmin = requireRole("ADMIN");
      const adminOUser = requireRole("ADMIN", "USER");

      const req = { user: { rol: "USER" } };
      const resSoloAdmin = createRes();
      const resAdminOUser = createRes();
      const nextSoloAdmin = jest.fn();
      const nextAdminOUser = jest.fn();

      soloAdmin(req, resSoloAdmin, nextSoloAdmin);
      adminOUser(req, resAdminOUser, nextAdminOUser);

      expect(resSoloAdmin.status).toHaveBeenCalledWith(403);
      expect(nextSoloAdmin).not.toHaveBeenCalled();
      expect(nextAdminOUser).toHaveBeenCalledTimes(1);
      expect(resAdminOUser.status).not.toHaveBeenCalled();
    });
  });
});
