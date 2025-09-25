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
router.get("/dashboard", authenticateToken, authorizeAdmin, getDashboardOverview);
router.get("/users", authenticateToken, authorizeAdmin, getAllUsers);
router.get("/users/:userId/orders", authenticateToken, authorizeAdmin, getUserOrders);
router.get("/users/:userId/cart", authenticateToken, authorizeAdmin, getUserCart);
router.get("/users/:userId/wishlist", authenticateToken, authorizeAdmin, getUserWishlist);
router.patch("/users/:userId/status", authenticateToken, authorizeAdmin, updateUserStatus);

export default router;