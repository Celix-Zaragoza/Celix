import { Router } from "express";
import { createPost, listPosts } from "../../controllers/posts.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { createPostSchema } from "../../schemas/posts.schema.js";

const router = Router();

router.get("/", listPosts);
router.post("/", requireAuth, validateBody(createPostSchema), createPost);

export default router;