import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { webhook, listMachines, updateMachine, getMachineThreshold, getMachineReadings } from "../controllers/machineryController.js";

const router = express.Router();

// Public endpoints for IoT modules / machines
router.post("/webhook", webhook);
router.get("/machines/:machineId/threshold", getMachineThreshold);
router.get("/machines/:machineId/readings", getMachineReadings);

// Admin-only endpoints
router.use(authenticateToken);
router.use(requireAdmin);

router.get("/machines", listMachines);
router.patch("/machines/:id", updateMachine);

export default router;
