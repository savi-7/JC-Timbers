import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { checkout, getMyOrders, adminListOrders, adminUpdateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

router.post("/checkout", authenticateToken, checkout);
router.get("/orders/me", authenticateToken, getMyOrders);

// Admin Order Management
router.get("/admin/orders", authenticateToken, requireAdmin, adminListOrders);
router.put("/admin/orders/:id", authenticateToken, requireAdmin, adminUpdateOrderStatus);

export default router;


