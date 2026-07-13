import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { addToCart, getCart, updateCartItem, removeCartItem } from "../controllers/cartController.js";

const router = express.Router();

router.post("/cart", authenticateToken, addToCart);
router.get("/cart", authenticateToken, getCart);
router.patch("/cart", authenticateToken, updateCartItem);
router.delete("/cart/:productId", authenticateToken, removeCartItem);

export default router;










