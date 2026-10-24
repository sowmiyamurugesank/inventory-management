import { Router } from "express";

import { warehouseController } from "../controllers/warehouse.controller.js";

const router = Router();

router.post("/", warehouseController.create);

export default router;
