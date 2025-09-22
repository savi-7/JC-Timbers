import express from "express";
import { authenticateToken, authorizeAdmin } from "../middleware/auth.js";
import { 
  getAllUsers, 
  getUserOrders, 
  updateUserStatus,
  getUserCart,
  getUserWishlist,
  getDashboardOverview
} from "../controllers/adminController.js";

const router = express.Router();

// Admin-only routes
router.get("/admin/dashboard", authenticateToken, authorizeAdmin, getDashboardOverview);
router.get("/admin/users", authenticateToken, authorizeAdmin, getAllUsers);
router.get("/admin/users/:userId/orders", authenticateToken, authorizeAdmin, getUserOrders);
router.get("/admin/users/:userId/cart", authenticateToken, authorizeAdmin, getUserCart);
router.get("/admin/users/:userId/wishlist", authenticateToken, authorizeAdmin, getUserWishlist);
router.patch("/admin/users/:userId/status", authenticateToken, authorizeAdmin, updateUserStatus);

export default router;