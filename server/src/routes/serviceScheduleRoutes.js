import express from "express";
import {
  createScheduleBlock,
  getAllScheduleBlocks,
  getScheduleByDate,
  updateScheduleBlock,
  deleteScheduleBlock,
  getAvailableSlots,
} from "../controllers/serviceScheduleController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public route - get available slots (NO authentication required)
// This route MUST be defined before any admin routes to avoid conflicts
router.get("/schedule/available/:date", (req, res, next) => {
  console.log('📅 Public availability route hit:', req.path);
  next();
}, getAvailableSlots);

// Admin routes - require authentication and admin role
router.post("/admin/schedule", authenticateToken, requireAdmin, createScheduleBlock);
router.get("/admin/schedule", authenticateToken, requireAdmin, getAllScheduleBlocks);
router.get("/admin/schedule/date/:date", authenticateToken, requireAdmin, getScheduleByDate);
router.put("/admin/schedule/:id", authenticateToken, requireAdmin, updateScheduleBlock);
router.delete("/admin/schedule/:id", authenticateToken, requireAdmin, deleteScheduleBlock);

export default router;
