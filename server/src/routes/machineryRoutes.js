import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { webhook, listMachines, updateMachine } from "../controllers/machineryController.js";

const router = express.Router();

router.post("/webhook", webhook);

router.use(authenticateToken);
router.use(requireAdmin);

router.get("/machines", listMachines);
router.patch("/machines/:id", updateMachine);

export default router;
