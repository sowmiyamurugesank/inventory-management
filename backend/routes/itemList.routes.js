import { Router } from "express";

import { itemListController } from "../controllers/itemList.controller.js";

const router = Router();

router.get("/", itemListController.list);

router.get("/:id", itemListController.getById);

router.post("/", itemListController.create);

router.put("/:id", itemListController.update);

router.delete("/:id", itemListController.delete);

export default router;
