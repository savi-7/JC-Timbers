// routes/auth.routes.js
import express from "express";
import { register, login, updateProfile, googleSignIn } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Local register & login
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.put("/profile", authenticateToken, updateProfile);

// Google login/signup
router.post("/google", googleSignIn);

export default router;
