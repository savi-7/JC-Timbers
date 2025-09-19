import express from "express";
import { authenticateToken, authorizeAdmin } from "../middleware/auth.js";
import { getDashboardOverview, getAllUsers, getAllProducts, getAllOrders, getCustomerDetails } from "../controllers/adminController.js";

const router = express.Router();

// Admin dashboard overview
router.get("/admin/overview", authenticateToken, authorizeAdmin, getDashboardOverview);

// Admin detailed data endpoints
router.get("/users", authenticateToken, authorizeAdmin, getAllUsers);
router.get("/products", authenticateToken, authorizeAdmin, getAllProducts);
router.get("/orders", authenticateToken, authorizeAdmin, getAllOrders);
router.get("/users/:userId", authenticateToken, authorizeAdmin, getCustomerDetails);

export default router;


