import express from "express";
import {
  getAllHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  checkHoliday,
} from "../controllers/holidayController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication and admin role
router.get("/", authenticateToken, requireAdmin, getAllHolidays);
router.post("/", authenticateToken, requireAdmin, createHoliday);
router.put("/:id", authenticateToken, requireAdmin, updateHoliday);
router.delete("/:id", authenticateToken, requireAdmin, deleteHoliday);
router.get("/check", authenticateToken, requireAdmin, checkHoliday);

export default router;
