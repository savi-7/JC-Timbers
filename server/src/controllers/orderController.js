import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

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

    // Prepare order items and total
    const orderItems = cart.items.map(({ product, quantity }) => ({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product?.images?.[0]?.filename ? `/uploads/${product.images[0].filename}` : undefined
    }));
    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      address,
      paymentMethod: ["COD", "Online"].includes(paymentMethod) ? paymentMethod : "COD",
      status: "Pending"
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

    return res.status(201).json(order);
  } catch (err) {
    return res.status(500).json({ message: "Checkout failed", error: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
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
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
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


