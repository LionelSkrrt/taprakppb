import express from "express";
import { SeriesController } from "../controllers/seriesController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", SeriesController.getAll);
router.get("/:id", SeriesController.getById);
router.post("/", adminAuth, SeriesController.create);
router.put("/:id", adminAuth, SeriesController.update);
router.delete("/:id", adminAuth, SeriesController.remove);

export default router;
