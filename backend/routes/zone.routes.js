import { Router } from "express";

import { zoneController } from "../controllers/zone.controller.js";

const router = Router();

router.get("/", zoneController.list);

router.post("/", zoneController.create);

router.patch("/:id", zoneController.update);

router.delete("/:id", zoneController.remove);

export default router;
