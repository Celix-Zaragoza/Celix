/**
 * @file index.js
 * @description Router principal de la API. Agrupa y monta todas las rutas bajo el prefijo /v1.
 */

import { Router } from "express";
import v1Router from "./v1/index.js";

const router = Router();

router.use("/v1", v1Router);

export default router;