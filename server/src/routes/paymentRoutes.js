import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  createRazorpayOrder, 
  verifyRazorpayPayment,
  createCODOrder 
} from '../controllers/paymentController.js';

const router = express.Router();

// Create Razorpay order
router.post('/razorpay', authenticateToken, createRazorpayOrder);

// Verify Razorpay payment
router.post('/verify', authenticateToken, verifyRazorpayPayment);

// Create COD order
router.post('/cod', authenticateToken, createCODOrder);

export default router;


