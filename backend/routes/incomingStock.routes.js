
import { Router } from "express";
import { incomingStockController } from "../controllers/incomingStock.controller.js";

const router = Router();

router.get("/", incomingStockController.list);

export default router;
