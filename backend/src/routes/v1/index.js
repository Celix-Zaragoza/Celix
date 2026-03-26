import { Router } from "express";
import authRouter from "./auth.routes.js";
import usersRouter from "./users.routes.js";
import postsRouter from "./posts.routes.js";
import conversationsRouter from "./conversations.routes.js";
import eventsRouter from "./events.routes.js";
import instalacionesRouter from "./instalaciones.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/posts", postsRouter);
router.use("/conversations", conversationsRouter);
router.use("/events", eventsRouter);
router.use("/instalaciones", instalacionesRouter);

export default router;