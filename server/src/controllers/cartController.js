import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Add or update product in cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "productId and quantity (>=1) are required" });
    }

    const product = await Product.findById(productId).select("_id quantity");
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    return res.status(200).json({ message: "Cart updated" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update cart", error: err.message });
  }
};

// Get current user's cart with product info and totals
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price images quantity"
    });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ items: [], total: 0 });
    }

    const items = cart.items.map(({ product, quantity }) => {
      // Handle image data similar to ProductCard component
      let imagePath = undefined;
      if (product?.images && product.images.length > 0) {
        const firstImage = product.images[0];
        
        // Check if it's the old Cloudinary format
        if (firstImage.url) {
          imagePath = firstImage.url;
        }
        // Check if it's the new MongoDB format with data
        else if (firstImage.data) {
          // If data starts with 'data:', it's already a data URL
          if (firstImage.data.startsWith('data:')) {
            imagePath = firstImage.data;
          }
          // Otherwise, construct the data URL
          else {
            imagePath = `data:${firstImage.contentType || 'image/jpeg'};base64,${firstImage.data}`;
          }
        }
        // Check if it's the old file-based format
        else if (firstImage.filename) {
          imagePath = `/uploads/${firstImage.filename}`;
        }
      }
      
      const subtotal = (product?.price || 0) * quantity;
      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: imagePath,
        subtotal,
        available: product.quantity
      };
    });

    const total = items.reduce((sum, i) => sum + i.subtotal, 0);
    return res.status(200).json({ items, total });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch cart", error: err.message });
  }
};

// Update quantity for a product in cart
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId, quantity } = req.body;
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "productId and valid quantity are required" });
    }
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx === -1) return res.status(404).json({ message: "Item not in cart" });
    cart.items[idx].quantity = quantity;
    await cart.save();
    return res.status(200).json({ message: "Quantity updated" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update quantity", error: err.message });
  }
};

// Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const initial = cart.items.length;
    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    if (cart.items.length === initial) return res.status(404).json({ message: "Item not in cart" });
    await cart.save();
    return res.status(200).json({ message: "Item removed" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to remove item", error: err.message });
  }
};










