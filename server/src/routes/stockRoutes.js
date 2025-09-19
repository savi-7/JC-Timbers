import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  createStock,
  getAllStock,
  getStockById,
  updateStock,
  deleteStock,
  getLowStockItems,
  updateStockQuantity
} from "../controllers/stockController.js";

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Stock CRUD routes
router.post("/", createStock);
router.get("/", getAllStock);
router.get("/low-stock", getLowStockItems);
router.get("/:id", getStockById);
router.put("/:id", updateStock);
router.put("/:id/quantity", updateStockQuantity);
router.delete("/:id", deleteStock);

export default router;










