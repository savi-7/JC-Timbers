import express from "express";
import {
  createEnquiry,
  getMyEnquiries,
  getEnquiryById,
  cancelEnquiry,
  adminGetAllEnquiries,
  adminGetEnquiryById,
  adminUpdateEnquiry,
  adminDeleteEnquiry,
  adminGetEnquiryStats,
  adminAcceptRequestedTime,
  adminProposeAlternateTime,
  createServicePaymentOrder,
  verifyServicePayment,
  adminMarkOfflinePaymentReceived,
} from "../controllers/serviceEnquiryController.js";
import { authenticateToken, requireAdmin, requireCustomer } from "../middleware/auth.js";
import { uploadImages, handleUploadError } from "../middleware/upload.js";

const router = express.Router();

// Customer routes - require authentication only (no role restriction)
// This route is accessible to any authenticated user (customer or admin)
router.post("/enquiries", 
  (req, res, next) => {
    console.log('🚀 Route POST /enquiries matched');
    console.log('Auth header present:', !!(req.headers.authorization || req.headers.Authorization));
    console.log('Content-Type:', req.headers['content-type']);
    next();
  },
  authenticateToken,
  (req, res, next) => {
    console.log('✅ After authenticateToken middleware');
    console.log('req.user exists:', !!req.user);
    console.log('req.user.userId:', req.user?.userId);
    
    if (!req.user || !req.user.userId) {
      console.error('❌ req.user is NOT SET after authenticateToken middleware!');
      console.error('req.user value:', req.user);
      return res.status(401).json({ message: 'Authentication failed - user not set' });
    }
    console.log('✅ req.user is properly set, proceeding to upload');
    next();
  },
  uploadImages,
  (req, res, next) => {
    console.log('✅ After uploadImages - req.user still exists:', !!req.user);
    next();
  },
  handleUploadError,
  createEnquiry
);
router.get("/enquiries/my", authenticateToken, getMyEnquiries);
router.get("/enquiries/:id", authenticateToken, getEnquiryById);
router.put("/enquiries/:id/cancel", authenticateToken, cancelEnquiry);

// Customer payment routes for timber services
router.post(
  "/enquiries/:id/payments/razorpay/order",
  authenticateToken,
  createServicePaymentOrder
);
router.post(
  "/enquiries/:id/payments/razorpay/verify",
  authenticateToken,
  verifyServicePayment
);

// Admin routes - require authentication and admin role
router.get("/admin/enquiries", authenticateToken, requireAdmin, adminGetAllEnquiries);
router.get("/admin/enquiries/stats", authenticateToken, requireAdmin, adminGetEnquiryStats);
router.get("/admin/enquiries/:id", authenticateToken, requireAdmin, adminGetEnquiryById);
router.put("/admin/enquiries/:id", authenticateToken, requireAdmin, adminUpdateEnquiry);
router.delete("/admin/enquiries/:id", authenticateToken, requireAdmin, adminDeleteEnquiry);
router.post("/admin/enquiries/:id/accept-time", authenticateToken, requireAdmin, adminAcceptRequestedTime);
router.post("/admin/enquiries/:id/propose-time", authenticateToken, requireAdmin, adminProposeAlternateTime);
router.post(
  "/admin/enquiries/:id/payments/offline/mark-paid",
  authenticateToken,
  requireAdmin,
  adminMarkOfflinePaymentReceived
);

export default router;
