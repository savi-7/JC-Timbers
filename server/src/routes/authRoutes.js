// routes/auth.routes.js
import express from "express";
import rateLimit from "express-rate-limit";
import { register, login, updateProfile, googleSignIn, changePassword, updateAddress, getUserProfile } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Login-specific rate limiter (brute-force protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

// Local register & login
router.post("/register", register);
router.post("/login", loginLimiter, login);

// Protected routes
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateProfile);
router.post("/update-address", authenticateToken, updateAddress);
router.put("/change-password", authenticateToken, changePassword);

// Google login/signup
router.post("/google", googleSignIn);

export default router;
