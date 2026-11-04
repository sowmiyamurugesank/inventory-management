import { Router } from "express";
import {
  purchaseOrderController,
} from "../controllers/purchaseOrder.controller.js";

const router = Router();

router.get("/", purchaseOrderController.list);
router.get("/:id", purchaseOrderController.getById);
router.post("/", purchaseOrderController.create);
router.put("/:id", purchaseOrderController.update);
router.delete("/:id", purchaseOrderController.delete);

export default router;