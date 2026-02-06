import User from "../models/User.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
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

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' })
      .select('name email phone address createdAt lastLogin status')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ 
      success: true, 
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        status: user.status || 'active'
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message 
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
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
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

// Update user status (admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be "active" or "inactive"' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    user.status = status;
    await user.save();
    
    return res.status(200).json({ 
      success: true, 
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status',
      error: error.message 
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
    
    // If it's an object with data property (base64)
    if (typeof firstImage === 'object' && firstImage.data) {
      return firstImage.data;
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