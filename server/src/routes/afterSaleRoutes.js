import express from "express";
import {
  createRequest,
  getMyRequests,
  getRequestById,
  cancelRequest,
  submitFeedback,
  confirmOnlinePayment,
  adminGetAllRequests,
  adminUpdateStatus,
  adminAssignTechnician,
  adminSetQuote,
  adminMarkOfflinePaid,
  adminGetAnalytics,
} from "../controllers/afterSaleController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Customer routes (authenticated)
router.post("/after-sale", authenticateToken, createRequest);
router.get("/after-sale/my", authenticateToken, getMyRequests);
router.get("/after-sale/:id", authenticateToken, getRequestById);
router.patch("/after-sale/:id/cancel", authenticateToken, cancelRequest);
router.post("/after-sale/:id/feedback", authenticateToken, submitFeedback);
router.patch("/after-sale/:id/pay-online", authenticateToken, confirmOnlinePayment);

// Admin routes (authenticated + admin)
router.get("/admin/after-sale/analytics", authenticateToken, requireAdmin, adminGetAnalytics);
router.get("/admin/after-sale", authenticateToken, requireAdmin, adminGetAllRequests);
router.patch("/admin/after-sale/:id/status", authenticateToken, requireAdmin, adminUpdateStatus);
router.patch("/admin/after-sale/:id/assign", authenticateToken, requireAdmin, adminAssignTechnician);
router.patch("/admin/after-sale/:id/quote", authenticateToken, requireAdmin, adminSetQuote);
router.patch("/admin/after-sale/:id/offline-paid", authenticateToken, requireAdmin, adminMarkOfflinePaid);

export default router;
