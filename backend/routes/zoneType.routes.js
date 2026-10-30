import { Router } from "express";
import { zoneTypeController } from "../controllers/zoneType.controller.js";

const router = Router();

router.get("/", zoneTypeController.list);
router.post("/", zoneTypeController.create);
router.patch("/:id", zoneTypeController.update);
router.delete("/:id", zoneTypeController.delete);

export default router;
