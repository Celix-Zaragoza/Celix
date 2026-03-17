import { Router } from "express";
import {
  getMe, updateMe, getUserById,
  followUser, unfollowUser,
  getFollowers, getFollowing,
  searchUsers,
} from "../../controllers/users.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { updateMeSchema } from "../../schemas/users.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de perfiles y relaciones sociales
 */

/**
 * @swagger
 * /api/v1/users/search:
 *   get:
 *     summary: Buscar usuarios por alias o nombre
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: "maria"
 *     responses:
 *       200:
 *         description: Lista de usuarios encontrados
 */
router.get("/search", requireAuth, searchUsers);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Devuelve el perfil del usuario autenticado
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autenticado
 *   patch:
 *     summary: Actualiza el perfil del usuario autenticado
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               alias:
 *                 type: string
 *               edad:
 *                 type: integer
 *               zona:
 *                 type: string
 *               avatar:
 *                 type: string
 *               deportesNivel:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     deporte:
 *                       type: string
 *                     nivel:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       409:
 *         description: Alias ya en uso
 */
router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, validateBody(updateMeSchema), updateMe);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Devuelve el perfil público de un usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil público
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/:id", requireAuth, getUserById);

/**
 * @swagger
 * /api/v1/users/{id}/follow:
 *   post:
 *     summary: Seguir a un usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ahora sigues a este usuario
 *       400:
 *         description: Ya le sigues o intentas seguirte a ti mismo
 *       404:
 *         description: Usuario no encontrado
 *   delete:
 *     summary: Dejar de seguir a un usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Has dejado de seguir a este usuario
 */
router.post("/:id/follow", requireAuth, followUser);
router.delete("/:id/follow", requireAuth, unfollowUser);

/**
 * @swagger
 * /api/v1/users/{id}/followers:
 *   get:
 *     summary: Lista de seguidores de un usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de seguidores
 */
router.get("/:id/followers", requireAuth, getFollowers);

/**
 * @swagger
 * /api/v1/users/{id}/following:
 *   get:
 *     summary: Lista de usuarios que sigue
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de seguidos
 */
router.get("/:id/following", requireAuth, getFollowing);

export default router;