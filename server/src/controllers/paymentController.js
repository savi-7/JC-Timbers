import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Lazy initialization of Razorpay instance
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env file');
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { amount, address } = req.body;
    
    // Get Razorpay instance (will throw error if credentials not set)
    const razorpay = getRazorpayInstance();

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (!address || !address.name || !address.phone) {
      return res.status(400).json({ message: 'Address details are required' });
    }

    // Get cart items to validate
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price quantity'
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock availability
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({ message: 'One of the products is unavailable' });
      }
      if (item.quantity > item.product.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}. Available: ${item.product.quantity}`
        });
      }
    }

    // Create Razorpay order
    // Receipt must be max 40 chars - using short format
    const shortUserId = userId.toString().slice(-8); // Last 8 chars of user ID
    const timestamp = Date.now().toString().slice(-10); // Last 10 digits of timestamp
    
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `ord_${shortUserId}_${timestamp}`, // Max 27 chars (ord_ + 8 + _ + 10)
      notes: {
        userId: userId.toString(),
        address: JSON.stringify(address)
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create payment order',
      error: error.message 
    });
  }
};

// Verify Razorpay payment and create order
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      address 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment verification failed' 
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price quantity images'
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
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
          console.log(`verifyRazorpayPayment - Using existing data URL for ${product.name}`);
        } else {
          // Convert to base64 and create data URL
          const base64Data = Buffer.isBuffer(imageData)
            ? imageData.toString('base64')
            : imageData;
          
          imageUrl = `data:${product.images[0].contentType};base64,${base64Data}`;
          console.log(`verifyRazorpayPayment - Created new data URL for ${product.name}`);
        }
        console.log(`  Image: ${imageUrl.substring(0, 100)}... (${imageUrl.length} chars)`);
      } else {
        console.log(`verifyRazorpayPayment - No image found for ${product.name}`);
      }
      
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: imageUrl
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingCost = subtotal < 1000 ? 50 : 0;
    const totalAmount = subtotal + shippingCost;

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingCost,
      address: {
        name: address.name,
        phone: address.phone,
        addressLine: address.addressLine || address.address,
        city: address.city,
        state: address.state,
        zip: address.zip
      },
      paymentMethod: 'Online',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'Processing'
    });

    // Decrement stock
    for (const item of cart.items) {
      await Product.updateOne(
        { _id: item.product._id, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Payment verified and order created successfully',
      order: {
        _id: order._id,
        orderId: order._id,
        totalAmount: order.totalAmount,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Payment verification failed',
      error: error.message 
    });
  }
};

// Create COD order
export const createCODOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { address } = req.body;

    if (!address || !address.name || !address.phone) {
      return res.status(400).json({ message: 'Address details are required' });
    }

    // Get cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price quantity images'
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({ message: 'One of the products is unavailable' });
      }
      if (item.quantity > item.product.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}. Available: ${item.product.quantity}`
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
          console.log(`createCODOrder - Using existing data URL for ${product.name}`);
        } else {
          // Convert to base64 and create data URL
          const base64Data = Buffer.isBuffer(imageData)
            ? imageData.toString('base64')
            : imageData;
          
          imageUrl = `data:${product.images[0].contentType};base64,${base64Data}`;
          console.log(`createCODOrder - Created new data URL for ${product.name}`);
        }
        console.log(`  Image: ${imageUrl.substring(0, 100)}... (${imageUrl.length} chars)`);
      } else {
        console.log(`createCODOrder - No image found for ${product.name}`);
      }
      
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: imageUrl
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingCost = subtotal < 1000 ? 50 : 0;
    const totalAmount = subtotal + shippingCost;

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingCost,
      address: {
        name: address.name,
        phone: address.phone,
        addressLine: address.addressLine || address.address,
        city: address.city,
        state: address.state,
        zip: address.zip
      },
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      status: 'Processing'
    });

    // Decrement stock
    for (const item of cart.items) {
      await Product.updateOne(
        { _id: item.product._id, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        _id: order._id,
        orderId: order._id,
        totalAmount: order.totalAmount,
        status: order.status
      }
    });
  } catch (error) {
    console.error('COD order creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create order',
      error: error.message 
    });
  }
};

