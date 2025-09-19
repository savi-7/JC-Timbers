import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  createWoodIntake,
  getAllWoodIntakes,
  updateWoodIntakeStatus,
  getVendorStats
} from "../controllers/vendorController.js";

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Vendor CRUD routes
router.post("/", createVendor);
router.get("/", getAllVendors);
router.get("/stats", getVendorStats);
router.get("/:id", getVendorById);
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor);

// Wood intake routes
router.post("/intake", createWoodIntake);
router.get("/intake/all", getAllWoodIntakes);
router.put("/intake/:id/status", updateWoodIntakeStatus);

export default router;










