import { Router } from "express";

import { warehouseController } from "../controllers/warehouse.controller.js";

const router = Router();

router.get("/", warehouseController.list);

router.post("/", warehouseController.create);

router.delete("/:id", warehouseController.remove);

export default router;
