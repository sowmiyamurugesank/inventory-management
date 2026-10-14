
import { Router } from "express";

import {
    list,
    getOne,
    create,
    update,
    remove,
} from "../controllers/staffLogin.controller.js";

const router = Router();

router.get("/", list);
router.get("/:id", getOne);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
