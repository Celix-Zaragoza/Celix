import { Router } from "express";
import { login, register } from "../../controllers/auth.controller.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../../schemas/auth.schema.js";

const router = Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/register", validateBody(registerSchema), register);

export default router;