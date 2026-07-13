import User from "../models/User.js";
import Product from "../models/Product.js";

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ message: "productId is required" });

    const product = await Product.findById(productId).select("_id");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(userId).select("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = user.wishlist.some(p => p.toString() === productId);
    if (!exists) {
      user.wishlist.push(productId);
      await user.save();
    }
    return res.status(200).json({ message: "Added to wishlist" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to add to wishlist", error: err.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).populate({ path: "wishlist", select: "name price images quantity" });
    if (!user) return res.status(404).json({ message: "User not found" });

    const items = (user.wishlist || []).map(p => {
      let imageUrl = undefined;
      
      if (p?.images && p.images.length > 0) {
        const firstImage = p.images[0];
        
        // Check if it's the old Cloudinary format
        if (firstImage.url) {
          imageUrl = firstImage.url;
        }
        // Check if it's the new MongoDB format with data
        else if (firstImage.data) {
          // If data starts with 'data:', it's already a data URL
          if (firstImage.data.startsWith('data:')) {
            imageUrl = firstImage.data;
          }
          // If data starts with 'http', it's a URL
          else if (firstImage.data.startsWith('http')) {
            imageUrl = firstImage.data;
          }
          // Otherwise, construct the data URL
          else {
            imageUrl = `data:${firstImage.contentType || 'image/jpeg'};base64,${firstImage.data}`;
          }
        }
        // Check if it's the old filename format
        else if (firstImage.filename) {
          imageUrl = `/uploads/${firstImage.filename}`;
        }
      }
      
      return {
        productId: p._id,
        name: p.name,
        price: p.price,
        image: imageUrl,
        available: p.quantity
      };
    });
    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch wishlist", error: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ message: "productId is required" });

    const user = await User.findById(userId).select("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter(p => p.toString() !== productId);
    await user.save();
    
    return res.status(200).json({ message: "Removed from wishlist" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to remove from wishlist", error: err.message });
  }
};










