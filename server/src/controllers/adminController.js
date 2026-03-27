import User from "../models/User.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Enquiry from "../models/Enquiry.js";
import ServiceEnquiry from "../models/ServiceEnquiry.js";
import AfterSaleRequest from "../models/AfterSaleRequest.js";
import Review from "../models/Review.js";
import Address from "../models/Address.js";
import { getBaseUrl } from "../utils/getBaseUrl.js";

// Get dashboard overview data (admin only)
export const getDashboardOverview = async (req, res) => {
  try {
    // Get total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    
    // Get new customers this month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    
    const newCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startOfMonth }
    });
    
    // Get total products
    const totalProducts = await Product.countDocuments();
    
    // Get total orders
    const totalOrders = await Order.countDocuments();
    
    // Get pending orders
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    
    // Get low stock items (assuming products with quantity < 10 are low stock)
    const lowStockItems = await Product.countDocuments({ quantity: { $lt: 10 } });
    
    // Get active users (users who logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.countDocuments({
      role: 'customer',
      lastLogin: { $gte: thirtyDaysAgo }
    });
    
    return res.status(200).json({
      success: true,
      totalUsers: totalCustomers,
      newUsers: newCustomers,
      totalProducts: totalProducts,
      totalOrders: totalOrders,
      pendingOrders: pendingOrders,
      lowStockItems: lowStockItems,
      activeUsers: activeUsers
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview',
      error: error.message
    });
  }
};

// Get all users (admin only) — includes order count & lifetime spend
export const getAllUsers = async (req, res) => {
  try {
    const rows = await User.aggregate([
      { $match: { role: "customer" } },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "orderDocs",
        },
      },
      {
        $addFields: {
          orderCount: { $size: "$orderDocs" },
          lifetimeSpend: {
            $ifNull: [{ $sum: "$orderDocs.totalAmount" }, 0],
          },
          lastOrderDate: { $max: "$orderDocs.createdAt" },
          lastStatusEvent: {
            $let: {
              vars: {
                statusEvents: {
                  $filter: {
                    input: "$adminActivityLog",
                    as: "e",
                    cond: { $eq: ["$$e.type", "status"] },
                  },
                },
              },
              in: { $arrayElemAt: ["$$statusEvents", 0] },
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          orderDocs: 0,
          password: 0,
          adminActivityLog: 0,
          wishlist: 0,
        },
      },
    ]);

    const users = rows.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      address: u.address,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      status: u.status || "active",
      orderCount: u.orderCount ?? 0,
      lifetimeSpend: u.lifetimeSpend ?? 0,
      lastOrderDate: u.lastOrderDate || null,
      lastStatusEvent: u.lastStatusEvent || null,
    }));

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get user orders (admin only)
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get user's orders
    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ 
      success: true, 
      orders: orders.map(order => ({
        _id: order._id,
        items: order.items,
        total: order.totalAmount,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus
      }))
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user orders',
      error: error.message 
    });
  }
};

// Update account status (admin only) — active | suspended | banned + reason + activity log
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;
    const reasonText = typeof reason === "string" ? reason.trim() : "";

    const allowed = ["active", "suspended", "banned"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(", ")}`,
      });
    }
    if (!reasonText) {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
      });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "customer") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const adminName = req.user?.name || "Admin";
    const adminId = req.user?.userId || req.user?.id;
    const prev = user.status;
    user.status = status;
    const entry = {
      type: "status",
      actionKey: "S",
      description: `Status changed from ${prev} to ${status} — Reason: ${reasonText}`,
      adminName,
      adminId,
      createdAt: new Date(),
    };
    user.adminActivityLog = user.adminActivityLog || [];
    user.adminActivityLog.unshift(entry);
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
      activity: entry,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

// Single customer profile (admin)
export const getUserByIdAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password -adminActivityLog").lean();
    if (!user || user.role !== "customer") {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const addresses = await Address.find({ userId }).lean();
    return res.status(200).json({
      success: true,
      user: {
        ...user,
        addresses,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// Activity log (admin)
export const getUserActivityAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("adminActivityLog role").lean();
    if (!user || user.role !== "customer") {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const log = [...(user.adminActivityLog || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return res.status(200).json({ success: true, activity: log });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity",
      error: error.message,
    });
  }
};

// Combined enquiries: custom (general) + timber processing
export const getUserEnquiriesAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const exists = await User.findById(userId).select("_id role").lean();
    if (!exists || exists.role !== "customer") {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const [general, timber] = await Promise.all([
      Enquiry.find({ user: userId }).sort({ createdAt: -1 }).lean(),
      ServiceEnquiry.find({ customerId: userId }).sort({ createdAt: -1 }).lean(),
    ]);

    const enquiries = [
      ...general.map((e) => ({
        _id: e._id,
        kind: "general",
        enquiryType: e.enquiryType,
        status: e.status,
        createdAt: e.createdAt,
        summary:
          e.customDescription ||
          e.selectedOptions?.additionalNotes ||
          `${e.enquiryType} enquiry`,
      })),
      ...timber.map((e) => ({
        _id: e._id,
        kind: "timber",
        enquiryType: "timber_processing",
        status: e.status,
        createdAt: e.createdAt,
        workType: e.workType,
        summary:
          e.notes?.trim() ||
          `${e.workType} — ${e.logItems?.length || 0} log batch(es)`,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ success: true, enquiries });
  } catch (error) {
    console.error("Error fetching user enquiries:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries",
      error: error.message,
    });
  }
};

export const getUserAfterSaleAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const exists = await User.findById(userId).select("_id role").lean();
    if (!exists || exists.role !== "customer") {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const requests = await AfterSaleRequest.find({ customerId: userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching after-sale requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch after-sale requests",
      error: error.message,
    });
  }
};

export const getUserReviewsAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const exists = await User.findById(userId).select("_id role").lean();
    if (!exists || exists.role !== "customer") {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const reviews = await Review.find({ user: userId })
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// Get user cart (admin only)
export const getUserCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price images category subcategory');
    
    if (!cart) {
      return res.status(200).json({ 
        success: true, 
        cart: { items: [], total: 0 } 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      cart: {
        items: cart.items.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
          image: getProductImageUrl(item.product.images),
          category: item.product.category,
          subcategory: item.product.subcategory
        })),
        total: cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      }
    });
  } catch (error) {
    console.error('Error fetching user cart:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user cart',
      error: error.message 
    });
  }
};

// Get user wishlist (admin only)
export const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId).populate('wishlist', 'name price images category subcategory');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      wishlist: user.wishlist.map(product => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: getProductImageUrl(product.images),
        category: product.category,
        subcategory: product.subcategory
      }))
    });
  } catch (error) {
    console.error('Error fetching user wishlist:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user wishlist',
      error: error.message 
    });
  }
};

// Helper function to get product image URL
const getProductImageUrl = (images) => {
  if (!images) return '';
  
  // If images is a string (single image)
  if (typeof images === 'string') {
    // If it's a Cloudinary URL
    if (images.startsWith('http')) {
      return images;
    }
    // If it's a local upload path
    if (images.startsWith('/uploads/')) {
      return `${getBaseUrl()}${images}`;
    }
    // If it's base64 data
    if (images.startsWith('data:')) {
      return images;
    }
    return images;
  }
  
  // If images is an array
  if (Array.isArray(images) && images.length > 0) {
    const firstImage = images[0];
    
    if (typeof firstImage === 'object') {
      if (firstImage.url) return firstImage.url;
      if (firstImage.data) return firstImage.data;
    }
    
    // If it's a string
    if (typeof firstImage === 'string') {
      // If it's a Cloudinary URL
      if (firstImage.startsWith('http')) {
        return firstImage;
      }
      // If it's a local upload path
      if (firstImage.startsWith('/uploads/')) {
        return `${getBaseUrl()}${firstImage}`;
      }
      // If it's base64 data
      if (firstImage.startsWith('data:')) {
        return firstImage;
      }
      return firstImage;
    }
  }
  
  return '';
};