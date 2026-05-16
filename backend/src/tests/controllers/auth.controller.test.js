/**
 * @file auth.controller.test.js
 * @description Tests unitarios del controlador de autenticación.
 * Comprueba el registro, actualización de perfil, inicio de sesión
 * y cierre de sesión, incluyendo los casos de error de cada flujo.
 */

import { jest } from "@jest/globals";
import { logger } from "../../config/logger.js";

const jwtSignMock = jest.fn();
const userFindOneMock = jest.fn();
const userCreateMock = jest.fn();
const userFindByIdMock = jest.fn();
const blacklistedTokenUpdateOneMock = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jwtSignMock,
  },
}));

jest.unstable_mockModule("../../models/index.js", () => ({
  User: {
    findOne: userFindOneMock,
    create: userCreateMock,
    findById: userFindByIdMock,
  },
  BlacklistedToken: {
    updateOne: blacklistedTokenUpdateOneMock,
  },
}));

const {
  register,
  update_profile,
  login,
  logout,
} = await import("../../controllers/auth.controller.js");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("controlador de autenticación", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    logger.info = jest.fn();
    logger.error = jest.fn();
    process.env.JWT_SECRET = "test-secret";
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  describe("registro", () => {
    test("devuelve status 409 cuando el correo ya esta registrado", async () => {
      const req = {
        body: {
          nombre: "Usuario Anonimo",
          email: "anonimo@example.test",
          password: "secret123",
          alias: "anonimo_01",
        },
      };
      const res = createRes();
      const next = jest.fn();

      userFindOneMock.mockResolvedValue({ email: "anonimo@example.test", alias: "anonimo_01" });

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "El email ya está en uso" });
      expect(userCreateMock).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test("devuelve 201 con token y usuario publico cuando el registro es correcto", async () => {

      const req = {
        body: {
          nombre: "Persona A",
          email: "persona.a@example.test",
          password: "secret123",
          alias: "persona_a",
        },
      };
      const res = createRes();
      const next = jest.fn();

      userFindOneMock.mockResolvedValue(null);
      jwtSignMock.mockReturnValue("signed.jwt.token");

      const createdUser = {
        _id: "user-001",
        nombre: "Persona A",
        email: "persona.a@example.test",
        alias: "persona_a",
        edad: 30,
        zona: "Zona 1",
        deportesNivel: [{ deporte: "Deporte A", nivel: 3 }],
        avatar: null,
        rol: "USER",
        perfilCompleto: true,
        seguidores: ["u-100"],
        siguiendo: ["u-200", "u-300"],
        createdAt: "2026-03-27T10:00:00.000Z",
      };
      userCreateMock.mockResolvedValue(createdUser);

      await register(req, res, next);

      expect(userCreateMock).toHaveBeenCalledWith({
        nombre: "Persona A",
        email: "persona.a@example.test",
        password: "secret123",
        alias: "persona_a",
      });
      expect(jwtSignMock).toHaveBeenCalledWith(
        { sub: "user-001", rol: "USER" },
        "test-secret",
        { expiresIn: "7d" }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        token: "signed.jwt.token",
        user: {
          id: "user-001",
          nombre: "Persona A",
          email: "persona.a@example.test",
          alias: "persona_a",
          edad: 30,
          zona: "Zona 1",
          deportesNivel: [{ deporte: "Deporte A", nivel: 3 }],
          avatar: null,
          rol: "USER",
          perfilCompleto: true,
          numSeguidores: 1,
          numSiguiendo: 2,
          createdAt: "2026-03-27T10:00:00.000Z",
        },
      });
    });
  });

  describe("actualización de perfil", () => {
    test("devuelve 404 cuando el usuario no existe", async () => {
      const req = { body: { userId: "missing-user" } };
      const res = createRes();
      const next = jest.fn();

      userFindByIdMock.mockResolvedValue(null);

      await update_profile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Usuario no encontrado" });
      expect(next).not.toHaveBeenCalled();
    });

    test("actualiza el perfil y marca perfilCompleto", async () => {
      const req = {
        body: {
          userId: "user-1",
          edad: 30,
          zona: "Zona 2",
          deportesNivel: [{ deporte: "Deporte B", nivel: 4 }],
        },
      };
      const res = createRes();
      const next = jest.fn();

      const user = {
        _id: "user-001",
        nombre: "Persona A",
        email: "persona.a@example.test",
        alias: "persona_a",
        edad: null,
        zona: "",
        deportesNivel: [],
        avatar: null,
        rol: "USER",
        perfilCompleto: false,
        seguidores: [],
        siguiendo: [],
        createdAt: "2026-03-27T10:00:00.000Z",
        update: jest.fn().mockResolvedValue(undefined),
      };

      userFindByIdMock.mockResolvedValue(user);

      await update_profile(req, res, next);

      expect(user.edad).toBe(30);
      expect(user.zona).toBe("Zona 2");
      expect(user.deportesNivel).toEqual([{ deporte: "Deporte B", nivel: 4 }]);
      expect(user.perfilCompleto).toBe(true);
      expect(user.update).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: true,
          user: expect.objectContaining({
            id: "user-001",
            perfilCompleto: true,
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("inicio de sesión", () => {
    test("devuelve 401 cuando las credenciales son invalidas", async () => {
      const req = { body: { email: "anonimo@example.test", password: "clave-invalida" } };
      const res = createRes();
      const next = jest.fn();

      const user = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      userFindOneMock.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Credenciales incorrectas" });
      expect(next).not.toHaveBeenCalled();
    });

    test("devuelve 403 cuando el usuario esta bloqueado", async () => {
      const req = { body: { email: "anonimo@example.test", password: "secret123" } };
      const res = createRes();
      const next = jest.fn();

      const user = {
        bloqueado: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      userFindOneMock.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Tu cuenta ha sido bloqueada" });
      expect(next).not.toHaveBeenCalled();
    });

    test("devuelve token y usuario cuando el login es correcto", async () => {
      process.env.JWT_SECRET = "test-secret";

      const req = { body: { email: "persona.a@example.test", password: "secret123" } };
      const res = createRes();
      const next = jest.fn();

      const user = {
        _id: "user-001",
        nombre: "Persona A",
        email: "persona.a@example.test",
        alias: "persona_a",
        edad: 30,
        zona: "Zona 1",
        deportesNivel: [],
        avatar: null,
        rol: "USER",
        perfilCompleto: false,
        seguidores: [],
        siguiendo: [],
        createdAt: "2026-03-27T10:00:00.000Z",
        bloqueado: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      userFindOneMock.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });
      jwtSignMock.mockReturnValue("signed.jwt.token");

      await login(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: true,
          token: "signed.jwt.token",
          user: expect.objectContaining({ id: "user-001", email: "persona.a@example.test" }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("cierre de sesión", () => {
    test("devuelve 400 cuando falta el hash del token", async () => {
      const req = {
        authTokenHash: undefined,
        authTokenExpiration: new Date("2026-04-01T00:00:00.000Z"),
      };
      const res = createRes();
      const next = jest.fn();

      await logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "No se pudo invalidar el token" });
      expect(blacklistedTokenUpdateOneMock).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test("inserta o reutiliza el hash y devuelve exito", async () => {
      const expiresAt = new Date("2026-04-01T00:00:00.000Z");
      const req = {
        authTokenHash: "hash-123",
        authTokenExpiration: expiresAt,
      };
      const res = createRes();
      const next = jest.fn();

      blacklistedTokenUpdateOneMock.mockResolvedValue({ acknowledged: true });

      await logout(req, res, next);

      expect(blacklistedTokenUpdateOneMock).toHaveBeenCalledWith(
        { tokenHash: "hash-123" },
        { $setOnInsert: { tokenHash: "hash-123", expiresAt } },
        { upsert: true }
      );
      expect(res.json).toHaveBeenCalledWith({ ok: true, message: "Sesión cerrada correctamente" });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
