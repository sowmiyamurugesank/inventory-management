import { Router } from "express";

import { itemCategoryController } from "../controllers/itemCategory.controller.js";

const router = Router();

router.get("/", itemCategoryController.list);

router.get("/:id", itemCategoryController.getById);

router.post("/", itemCategoryController.create);

router.patch("/:id", itemCategoryController.update);

router.delete("/:id", itemCategoryController.remove);

export default router;
