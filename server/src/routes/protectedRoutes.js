import express from "express";
import { authorizeRole, requireAdmin, requireCustomer, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Admin Overview API - Comprehensive dashboard data
// NOTE: This route is now handled by adminRoutes.js with real database data
// router.get("/admin/overview", requireAdmin, (req, res) => {
//   // Mock data removed - now using real data from adminController.js
// });

// Admin users route moved to adminRoutes.js for proper database integration

// Customer-only routes
router.get("/customer/profile", requireCustomer, (req, res) => {
  res.json({
    message: "Customer Profile",
    user: req.user,
    profile: {
      orders: 5,
      wishlist: 12,
      loyaltyPoints: 250
    }
  });
});

router.get("/customer/orders", requireCustomer, (req, res) => {
  res.json({
    message: "Customer Orders",
    orders: [
      { id: 1, product: "Teak Chair", status: "delivered", amount: 15000 },
      { id: 2, product: "Rosewood Table", status: "shipped", amount: 25000 }
    ]
  });
});

// Multiple roles example (admin OR customer)
router.get("/shared/settings", authorizeRoles(['admin', 'customer']), (req, res) => {
  res.json({
    message: "Settings accessible to both admin and customer",
    user: req.user,
    settings: {
      notifications: true,
      theme: "dark"
    }
  });
});

// Using authorizeRole directly for admin
router.get("/admin/reports", authorizeRole('admin'), (req, res) => {
  res.json({
    message: "Admin Reports",
    reports: {
      sales: "Sales report data",
      users: "User analytics",
      inventory: "Stock levels"
    }
  });
});

export default router;
