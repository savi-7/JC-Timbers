import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { addToWishlist, getWishlist } from "../controllers/wishlistController.js";

const router = express.Router();

router.post("/wishlist/:productId", authenticateToken, addToWishlist);
router.get("/wishlist", authenticateToken, getWishlist);

export default router;










