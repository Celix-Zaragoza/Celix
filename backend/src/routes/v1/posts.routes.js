/**
 * @file posts.routes.js
 * @description Rutas para la gestión de publicaciones: feed global, feed de seguidos,
 * posts por usuario, creación, eliminación y likes.
 */

import { Router } from "express";
import {
  getPosts, 
  getFollowingFeed, 
  getParaTiFeed, 
  createPost,
  deletePost, 
  likePost, 
  unlikePost, 
  getPostsByUser,
} from "../../controllers/posts.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { createPostSchema } from "../../schemas/posts.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Publicaciones y feeds
 */

/**
 * @swagger
 * /api/v1/posts/para-ti:
 *   get:
 *     summary: Feed personalizado Para ti mediante IA Gemini
 *     description: Devuelve un feed ordenado por relevancia segun los deportes y niveles del usuario.
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de posts ordenada por afinidad
 */
router.get("/para-ti", requireAuth, getParaTiFeed);

/**
 * @swagger
 * /api/v1/posts/following:
 *   get:
 *     summary: Feed de usuarios seguidos, orden cronológico
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Posts de usuarios seguidos
 */
router.get("/following", requireAuth, getFollowingFeed);

/**
 * @swagger
 * /api/v1/posts/user/{id}:
 *   get:
 *     summary: Posts públicos de un usuario concreto
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Posts del usuario
 */
router.get("/user/:id", requireAuth, getPostsByUser);

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Feed global paginado
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: deporte
 *         schema:
 *           type: string
 *         example: "Running"
 *     responses:
 *       200:
 *         description: Lista de posts
 *   post:
 *     summary: Crear una publicación
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contenido, deporte]
 *             properties:
 *               contenido:
 *                 type: string
 *                 example: "Gran sesión de running hoy!"
 *               deporte:
 *                 type: string
 *                 example: "Running"
 *               ubicacion:
 *                 type: string
 *                 example: "Parque Grande"
 *               tipo:
 *                 type: string
 *                 enum: [entrenamiento, resultado, plan]
 *               imagen:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post creado
 */
router.get("/", requireAuth, getPosts);
router.post("/", requireAuth, validateBody(createPostSchema), createPost);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   delete:
 *     summary: Eliminar una publicación (solo el autor)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post eliminado
 *       403:
 *         description: No eres el autor
 *       404:
 *         description: Post no encontrado
 */
router.delete("/:id", requireAuth, deletePost);

/**
 * @swagger
 * /api/v1/posts/{id}/like:
 *   post:
 *     summary: Dar like a un post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like registrado
 *       400:
 *         description: Ya diste like
 *   delete:
 *     summary: Quitar like a un post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like eliminado
 */
router.post("/:id/like", requireAuth, likePost);
router.delete("/:id/like", requireAuth, unlikePost);

export default router;