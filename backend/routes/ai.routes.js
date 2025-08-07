import { Router } from "express";
import * as aiController from "../controllers/aiController.js";
const router = Router();

router.get("/get-result", aiController.getResult);
router.get("/list-models", aiController.listModels);
router.get("/health", aiController.healthCheck);

export default router;