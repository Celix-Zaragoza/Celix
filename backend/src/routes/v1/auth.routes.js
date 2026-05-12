/**
 * @file auth.routes.js
 * @description Rutas de autenticación: registro, inicio de sesión,
 * consulta del usuario autenticado y cierre de sesión.
 */

import { Router } from "express";
import { login, register, getAuthMe, logout } from "../../controllers/auth.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../../schemas/auth.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y sesión
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registro de nuevo usuario
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password, alias]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "María García"
 *               email:
 *                 type: string
 *                 example: "maria@celix.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               alias:
 *                 type: string
 *                 example: "maria_zgz"
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       409:
 *         description: Email o alias ya en uso
 */
router.post("/register", validateBody(registerSchema), register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Inicio de sesión
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "maria@celix.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login correcto, devuelve token JWT
 *       401:
 *         description: Credenciales incorrectas
 *       403:
 *         description: Cuenta bloqueada
 */
router.post("/login", validateBody(loginSchema), login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Devuelve el usuario autenticado según el token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado
 *       401:
 *         description: No autenticado
 */
router.get("/me", requireAuth, getAuthMe);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Invalida el token JWT actual (blacklist)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *       401:
 *         description: No autenticado
 */
router.post("/logout", requireAuth, logout);

export default router;