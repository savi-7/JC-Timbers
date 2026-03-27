import express from "express";
import { authenticateToken, authorizeAdmin } from "../middleware/auth.js";
import { 
  getAllUsers, 
  getUserOrders, 
  updateUserStatus,
  getUserCart,
  getUserWishlist,
  getDashboardOverview,
  getUserByIdAdmin,
  getUserActivityAdmin,
  getUserEnquiriesAdmin,
  getUserAfterSaleAdmin,
  getUserReviewsAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

// Admin-only routes
router.get("/dashboard", authenticateToken, authorizeAdmin, getDashboardOverview);
router.get("/users", authenticateToken, authorizeAdmin, getAllUsers);
router.get("/users/:userId/orders", authenticateToken, authorizeAdmin, getUserOrders);
router.get("/users/:userId/cart", authenticateToken, authorizeAdmin, getUserCart);
router.get("/users/:userId/wishlist", authenticateToken, authorizeAdmin, getUserWishlist);
router.get("/users/:userId/activity", authenticateToken, authorizeAdmin, getUserActivityAdmin);
router.get("/users/:userId/enquiries", authenticateToken, authorizeAdmin, getUserEnquiriesAdmin);
router.get("/users/:userId/after-sale", authenticateToken, authorizeAdmin, getUserAfterSaleAdmin);
router.get("/users/:userId/reviews", authenticateToken, authorizeAdmin, getUserReviewsAdmin);
router.patch("/users/:userId/status", authenticateToken, authorizeAdmin, updateUserStatus);
router.get("/users/:userId", authenticateToken, authorizeAdmin, getUserByIdAdmin);

export default router;