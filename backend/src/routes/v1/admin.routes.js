/**
 * @file admin.routes.js
 * @description Rutas de administración para la moderación de publicaciones,
 * usuarios y eventos. Todas requieren autenticación y rol ADMIN.
 */

import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { triggerSync } from "../../controllers/events.controller.js";
import {
  listPosts, hidePost, restorePost, deletePost,
  listUsers, blockUser, unblockUser,
  listEvents, hideEvent, restoreEvent,
} from "../../controllers/admin.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Moderación y gestión administrativa
 */

// Todas las rutas admin requieren AUTH + rol ADMIN
router.use(requireAuth, requireRole("ADMIN"));

// Publicaciones
/**
 * @swagger
 * /api/v1/admin/posts:
 *   get:
 *     summary: Listar publicaciones para moderación
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por contenido
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [ocultos, visibles]
 *     responses:
 *       200:
 *         description: Lista paginada de publicaciones
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos de administrador
 */
router.get("/posts", listPosts);

/**
 * @swagger
 * /api/v1/admin/posts/{id}/hide:
 *   patch:
 *     summary: Ocultar una publicación
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Publicación ocultada
 *       404:
 *         description: Post no encontrado
 */
router.patch("/posts/:id/hide", hidePost);

/**
 * @swagger
 * /api/v1/admin/posts/{id}/restore:
 *   patch:
 *     summary: Restaurar visibilidad de una publicación
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Publicación restaurada
 *       404:
 *         description: Post no encontrado
 */
router.patch("/posts/:id/restore", restorePost);

/**
 * @swagger
 * /api/v1/admin/posts/{id}:
 *   delete:
 *     summary: Eliminar publicación (soft delete)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post eliminado
 *       404:
 *         description: Post no encontrado
 */
router.delete("/posts/:id", deletePost);

// Usuarios
/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Listar usuarios para administración
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por alias, nombre o email
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [bloqueados, activos]
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos de administrador
 */
router.get("/users", listUsers);

/**
 * @swagger
 * /api/v1/admin/users/{id}/block:
 *   patch:
 *     summary: Bloquear un usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario bloqueado
 *       400:
 *         description: No puedes bloquearte a ti mismo
 *       404:
 *         description: Usuario no encontrado
 */
router.patch("/users/:id/block", blockUser);

/**
 * @swagger
 * /api/v1/admin/users/{id}/unblock:
 *   patch:
 *     summary: Desbloquear un usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario desbloqueado
 *       404:
 *         description: Usuario no encontrado
 */
router.patch("/users/:id/unblock", unblockUser);

// Eventos
/**
 * @swagger
 * /api/v1/admin/events:
 *   get:
 *     summary: Listar eventos para moderación
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por título
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [ocultos, visibles]
 *     responses:
 *       200:
 *         description: Lista paginada de eventos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos de administrador
 */
router.get("/events", listEvents);

/**
 * @swagger
 * /api/v1/admin/events/{id}/hide:
 *   patch:
 *     summary: Ocultar un evento
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento ocultado
 *       404:
 *         description: Evento no encontrado
 */
router.patch("/events/:id/hide", hideEvent);

/**
 * @swagger
 * /api/v1/admin/events/{id}/restore:
 *   patch:
 *     summary: Restaurar visibilidad de un evento
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento restaurado
 *       404:
 *         description: Evento no encontrado
 */
router.patch("/events/:id/restore", restoreEvent);

/**
 * @swagger
 * /api/v1/admin/events/sync:
 *   post:
 *     summary: Forzar sincronización manual de eventos con la API de Zaragoza
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sincronización completada correctamente
 *       500:
 *         description: Error durante la sincronización
 */
router.post("/events/sync", triggerSync);

export default router;