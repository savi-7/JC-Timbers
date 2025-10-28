import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "../services/emailService.js";

export const checkout = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { address, paymentMethod } = req.body;

    // Basic address validation
    const requiredFields = ["street", "city", "state", "zip", "country"];
    for (const f of requiredFields) {
      if (!address?.[f]) return res.status(400).json({ message: `Address field ${f} is required` });
    }

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price quantity images"
    });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate stock
    for (const item of cart.items) {
      if (!item.product) return res.status(400).json({ message: "One of the products is unavailable" });
      if (item.quantity > item.product.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}. Requested ${item.quantity}, available ${item.product.quantity}`
        });
      }
    }

    // Prepare order items with proper base64 encoding
    const orderItems = cart.items.map(({ product, quantity }) => {
      let imageUrl = null;
      
      if (product?.images?.[0]?.data && product?.images?.[0]?.contentType) {
        const imageData = product.images[0].data;
        
        // Convert Buffer to string if needed
        const dataAsString = Buffer.isBuffer(imageData)
          ? imageData.toString('utf8')  // Convert to string first
          : imageData;
        
        // Check if it's already a complete data URL
        if (typeof dataAsString === 'string' && dataAsString.startsWith('data:')) {
          imageUrl = dataAsString;
          console.log(`checkout - Using existing data URL for ${product.name}`);
        } else {
          // Convert to base64 and create data URL
          const base64Data = Buffer.isBuffer(imageData)
            ? imageData.toString('base64')
            : imageData;
          
          imageUrl = `data:${product.images[0].contentType};base64,${base64Data}`;
          console.log(`checkout - Created new data URL for ${product.name}`);
        }
        console.log(`  Image: ${imageUrl.substring(0, 100)}... (${imageUrl.length} chars)`);
      } else {
        console.log(`checkout - No image found for ${product.name}`);
      }
      
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: imageUrl
      };
    });
    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      address,
      paymentMethod: ["COD", "Online"].includes(paymentMethod) ? paymentMethod : "COD",
      paymentStatus: paymentMethod === "Online" ? "Paid" : "Pending",
      status: "Pending"
    });

    // Decrement stock with verification
    const stockUpdateResults = [];
    for (const item of cart.items) {
      const result = await Product.updateOne(
        { _id: item.product._id, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } }
      );
      
      stockUpdateResults.push({
        productId: item.product._id,
        productName: item.product.name,
        updated: result.modifiedCount > 0,
        requestedQty: item.quantity
      });
      
      // Log stock update
      if (result.modifiedCount > 0) {
        console.log(`✅ Stock reduced for ${item.product.name}: -${item.quantity}`);
      } else {
        console.log(`⚠️  Failed to reduce stock for ${item.product.name} (may be out of stock)`);
      }
    }
    
    // Log all stock updates
    console.log('\n📦 Stock Update Summary:');
    stockUpdateResults.forEach(result => {
      console.log(`  ${result.updated ? '✅' : '❌'} ${result.productName}: ${result.updated ? 'Updated' : 'Failed'}`);
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send order confirmation email with PDF invoice
    try {
      // Get user email
      const user = await User.findById(userId).select('email');
      if (user && user.email) {
        console.log(`📧 Sending order confirmation email to: ${user.email}`);
        const emailResult = await sendOrderConfirmationEmail(order, user.email);
        if (emailResult.success) {
          console.log('✅ Order confirmation email sent successfully!');
        } else {
          console.warn('⚠️  Order confirmation email failed:', emailResult.error);
        }
      } else {
        console.warn('⚠️  User email not found, skipping email notification');
      }
    } catch (emailError) {
      // Don't fail the order if email fails
      console.error('❌ Error sending order confirmation email:', emailError.message);
    }

    return res.status(201).json(order);
  } catch (err) {
    return res.status(500).json({ message: "Checkout failed", error: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    
    // Log order details for debugging
    console.log(`getMyOrders - Found ${orders.length} orders for user ${userId}`);
    orders.forEach((order, index) => {
      console.log(`\n  Order ${index + 1} (${order._id}):`);
      console.log(`    Items: ${order.items.length}`);
      order.items.forEach((item, i) => {
        console.log(`      Item ${i + 1}: ${item.name}`);
        console.log(`        Has image: ${!!item.image}`);
        if (item.image) {
          console.log(`        Image length: ${item.image.length}`);
          console.log(`        Image preview: ${item.image.substring(0, 50)}...`);
        }
      });
    });
    
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

// ADMIN: list all orders (optionally filter by status)
export const adminListOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = normalizeStatus(status);
    }
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "name email" });
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

// ADMIN: update order status
export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;
    if (!status) return res.status(400).json({ message: "status is required" });
    status = normalizeStatus(status);

    const allowed = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate({ path: "user", select: "email" });
    
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    // Send status update email
    try {
      if (order.user && order.user.email) {
        console.log(`📧 Sending order status update email to: ${order.user.email}`);
        const emailResult = await sendOrderStatusUpdateEmail(order, order.user.email, status);
        if (emailResult.success) {
          console.log('✅ Status update email sent successfully!');
        } else {
          console.warn('⚠️  Status update email failed:', emailResult.error);
        }
      }
    } catch (emailError) {
      console.error('❌ Error sending status update email:', emailError.message);
    }
    
    return res.status(200).json(order);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
};

function normalizeStatus(value) {
  if (!value) return value;
  const v = String(value).trim().toLowerCase();
  switch (v) {
    case "pending": return "Pending";
    case "processing": return "Processing";
    case "shipped": return "Shipped";
    case "delivered": return "Delivered";
    case "cancelled":
    case "canceled": return "Cancelled";
    default:
      // Try to title-case unknowns
      return v.charAt(0).toUpperCase() + v.slice(1);
  }
}

// ADMIN: Mark COD order as paid
export const adminMarkCODPaid = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    // Check if it's a COD order
    if (order.paymentMethod !== 'COD') {
      return res.status(400).json({ message: "This is not a Cash on Delivery order" });
    }
    
    // Update payment status to Paid
    order.paymentStatus = 'Paid';
    await order.save();
    
    console.log(`✅ COD Order ${id} marked as PAID`);
    
    return res.status(200).json({ 
      message: "Payment received and marked as paid", 
      order 
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update payment status", error: err.message });
  }
};

// ADMIN: Get revenue statistics
export const getRevenueStats = async (req, res) => {
  try {
    // Get all paid orders (Online payments that are Paid, and COD orders marked as Paid)
    const paidOrders = await Order.find({ 
      paymentStatus: 'Paid',
      status: { $ne: 'Cancelled' } // Exclude cancelled orders
    });
    
    // Calculate total revenue
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Calculate revenue by payment method
    const onlineRevenue = paidOrders
      .filter(order => order.paymentMethod === 'Online')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const codRevenue = paidOrders
      .filter(order => order.paymentMethod === 'COD')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Get pending COD payments (COD orders not yet paid)
    const pendingCODOrders = await Order.find({
      paymentMethod: 'COD',
      paymentStatus: { $ne: 'Paid' },
      status: { $nin: ['Cancelled'] }
    });
    
    const pendingCODRevenue = pendingCODOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Count orders
    const totalPaidOrders = paidOrders.length;
    const onlineOrders = paidOrders.filter(order => order.paymentMethod === 'Online').length;
    const codOrders = paidOrders.filter(order => order.paymentMethod === 'COD').length;
    const pendingCODOrdersCount = pendingCODOrders.length;
    
    console.log('Revenue Stats:', {
      totalRevenue,
      onlineRevenue,
      codRevenue,
      pendingCODRevenue,
      totalPaidOrders,
      onlineOrders,
      codOrders,
      pendingCODOrdersCount
    });
    
    return res.status(200).json({
      totalRevenue,
      onlineRevenue,
      codRevenue,
      pendingCODRevenue,
      totalPaidOrders,
      onlineOrders,
      codOrders,
      pendingCODOrdersCount
    });
  } catch (err) {
    console.error('Error fetching revenue stats:', err);
    return res.status(500).json({ message: "Failed to fetch revenue statistics", error: err.message });
  }
};


