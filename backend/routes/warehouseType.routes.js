import { Router } from "express";

import { warehouseTypeController } from "../controllers/warehouseType.controller.js";

const router = Router();

router.get("/", warehouseTypeController.list);
router.post("/", warehouseTypeController.create);
router.patch("/:id", warehouseTypeController.update);
router.delete("/:id", warehouseTypeController.remove);

export default router;
