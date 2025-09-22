import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlistController.js";

const router = express.Router();

router.post("/wishlist/:productId", authenticateToken, addToWishlist);
router.get("/wishlist", authenticateToken, getWishlist);
router.delete("/wishlist/:productId", authenticateToken, removeFromWishlist);

export default router;










