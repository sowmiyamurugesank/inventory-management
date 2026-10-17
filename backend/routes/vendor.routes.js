import { Router } from "express";

import { vendorController } from "../controllers/vendor.controller.js";

const router = Router();

// GET all suppliers
router.get("/", vendorController.getAll);

// GET a single supplier
router.get("/:id", vendorController.getById);

// CREATE a supplier
router.post("/", vendorController.create);

// UPDATE a supplier
router.put("/:id", vendorController.update);

// DELETE a supplier
router.delete("/:id", vendorController.delete);

export default router;
