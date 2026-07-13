import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  checkout,
  getMyOrders,
  adminListOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
  adminMarkCODPaid,
  getRevenueStats,
  resetRevenueStats,
  createOrderFromEnquiry
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/checkout", authenticateToken, checkout);
router.post("/orders/enquiry-checkout", authenticateToken, createOrderFromEnquiry);
router.get("/orders/me", authenticateToken, getMyOrders);

// Admin Order Management
router.get("/admin/orders", authenticateToken, requireAdmin, adminListOrders);
router.get("/admin/orders/:id", authenticateToken, requireAdmin, adminGetOrderById);
router.put("/admin/orders/:id", authenticateToken, requireAdmin, adminUpdateOrderStatus);
router.put("/admin/orders/:id/mark-paid", authenticateToken, requireAdmin, adminMarkCODPaid);

// Admin Revenue Statistics
router.get("/admin/revenue-stats", authenticateToken, requireAdmin, getRevenueStats);
router.post("/admin/revenue-reset", authenticateToken, requireAdmin, resetRevenueStats);

export default router;


