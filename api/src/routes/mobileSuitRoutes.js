import express from "express";
import { MobileSuitController } from "../controllers/mobileSuitController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", MobileSuitController.getAll);
router.get("/:id", MobileSuitController.getById);
router.post("/", adminAuth, MobileSuitController.create);
router.put("/:id", adminAuth, MobileSuitController.update);
router.delete("/:id", adminAuth, MobileSuitController.remove);

export default router;
