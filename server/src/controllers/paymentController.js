import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import AfterSaleRequest from '../models/AfterSaleRequest.js';
import Address from '../models/Address.js';

/** Save address used at checkout to user's Address collection so it appears on /addresses */
async function saveCheckoutAddressToAddresses(userId, address) {
  if (!address || !address.name || !address.phone) return;
  const fullName = address.name;
  const mobileNumber = String(address.phone).replace(/\D/g, '').slice(-10);
  const pincode = String(address.zip || address.pincode || '').trim().slice(0, 6);
  const state = (address.state || '').trim();
  const addressLine = (address.addressLine || address.address || '').trim();
  const flatHouseCompany = (address.flatHouseCompany || '').trim() || '—';
  const city = (address.city || '').trim();
  if (!pincode || pincode.length !== 6 || !state || !addressLine || !city) return;

  const existing = await Address.findOne({
    userId,
    mobileNumber,
    pincode,
    address: addressLine,
    flatHouseCompany
  });
  if (existing) return;

  try {
    await Address.create({
      userId,
      fullName,
      mobileNumber,
      pincode,
      state,
      address: addressLine,
      flatHouseCompany,
      city,
      landmark: (address.landmark || '').trim(),
      addressType: address.addressType || 'Home',
      isDefault: false
    });
  } catch (err) {
    console.error('saveCheckoutAddressToAddresses:', err.message);
  }
}

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

// Create Razorpay order for After-Sale Service (no cart dependency)
export const createAfterSalePaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: 'requestId is required' });
    }

    const asr = await AfterSaleRequest.findById(requestId);
    if (!asr) {
      return res.status(404).json({ message: 'After-sale request not found' });
    }

    if (asr.customerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not allowed to pay for this request' });
    }

    const quotedAmount = asr.invoice?.quotedAmount || 0;
    if (!quotedAmount || quotedAmount <= 0) {
      return res.status(400).json({ message: 'No valid quote set for this request' });
    }

    const razorpay = getRazorpayInstance();

    const shortUserId = userId.toString().slice(-8);
    const timestamp = Date.now().toString().slice(-10);

    const options = {
      amount: Math.round(quotedAmount * 100),
      currency: 'INR',
      receipt: `asr_${shortUserId}_${timestamp}`,
      notes: {
        userId: userId.toString(),
        afterSaleRequestId: asr._id.toString()
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
    console.error('Razorpay after-sale order error:', error);
    res.status(500).json({
      message: 'Failed to create after-sale payment order',
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

    await saveCheckoutAddressToAddresses(userId, address);

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
    console.log('\n📦 Stock Update Summary (Razorpay Payment):');
    stockUpdateResults.forEach(result => {
      console.log(`  ${result.updated ? '✅' : '❌'} ${result.productName}: ${result.updated ? 'Updated' : 'Failed'}`);
    });

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

    await saveCheckoutAddressToAddresses(userId, address);

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

