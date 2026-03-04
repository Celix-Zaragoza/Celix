import { Router } from "express";
import { getMe, updateMe } from "../../controllers/users.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { updateMeSchema } from "../../schemas/users.schema.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, validateBody(updateMeSchema), updateMe);

export default router;