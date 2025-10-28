import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { 
  checkout, 
  getMyOrders, 
  adminListOrders, 
  adminUpdateOrderStatus,
  adminMarkCODPaid,
  getRevenueStats
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/checkout", authenticateToken, checkout);
router.get("/orders/me", authenticateToken, getMyOrders);

// Admin Order Management
router.get("/admin/orders", authenticateToken, requireAdmin, adminListOrders);
router.put("/admin/orders/:id", authenticateToken, requireAdmin, adminUpdateOrderStatus);
router.put("/admin/orders/:id/mark-paid", authenticateToken, requireAdmin, adminMarkCODPaid);

// Admin Revenue Statistics
router.get("/admin/revenue-stats", authenticateToken, requireAdmin, getRevenueStats);

export default router;


