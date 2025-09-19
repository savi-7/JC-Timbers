import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Stock from "../models/Stock.js";

export const getDashboardOverview = async (req, res) => {
  try {
    console.log('Fetching dashboard overview for admin:', req.user.email);
    
    // Get counts from database
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      lowStockItems
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Stock.countDocuments({ quantity: { $lt: 10 } }) // Assuming low stock is < 10
    ]);

    // Calculate revenue (sum of completed orders)
    const revenueResult = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get recent activity (last 5 orders)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('user totalAmount status createdAt');

    // Calculate new users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    const dashboardData = {
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      pendingOrders,
      lowStockItems,
      activeUsers: totalUsers, // For now, same as total users
      newUsers,
      recentActivity: recentOrders.map(order => ({
        id: order._id,
        message: `New order from ${order.user?.name || 'Unknown User'}`,
        time: new Date(order.createdAt).toLocaleDateString(),
        status: order.status
      }))
    };

    console.log('Dashboard data prepared:', {
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      pendingOrders,
      lowStockItems,
      newUsers
    });

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      message: error.message 
    });
  }
};

// Get all users for admin overview
export const getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users for admin:', req.user.email);
    
    // Return only customers (exclude admins)
    const users = await User.find({ role: 'customer' })
      .select('name email role createdAt')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: error.message 
    });
  }
};

// Get details for a specific customer: profile, cart, and orders
export const getCustomerDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Load user and ensure is customer
    const user = await User.findOne({ _id: userId, role: 'customer' })
      .select('name email role createdAt');
    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Load cart with product details
    const cart = await (await import('../models/Cart.js')).default
      .findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name price images category',
      })
      .lean();

    // Load orders for this user
    const orders = await Order.find({ user: userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .select('items totalAmount status paymentMethod createdAt')
      .lean();

    return res.json({
      user,
      cart: cart || { items: [] },
      orders,
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({
      error: 'Failed to fetch customer details',
      message: error.message,
    });
  }
};

// Get all products for admin overview
export const getAllProducts = async (req, res) => {
  try {
    console.log('Fetching all products for admin:', req.user.email);
    
    const products = await Product.find()
      .select('name description category price quantity unit isActive createdAt')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message 
    });
  }
};

// Get all orders for admin overview
export const getAllOrders = async (req, res) => {
  try {
    console.log('Fetching all orders for admin:', req.user.email);
    
    const orders = await Order.find()
      .populate('user', 'name email')
      .select('user items totalAmount status paymentMethod createdAt')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      message: error.message 
    });
  }
};
