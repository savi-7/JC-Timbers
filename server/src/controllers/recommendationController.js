import Product from '../models/Product.js';

/**
 * KNN-based Similar Products Recommendation
 * Calculates similarity based on:
 * - Price (40% weight)
 * - Subcategory (30% weight)
 * - Size (15% weight)
 * - Unit (15% weight)
 */

// Calculate similarity score between two products
function calculateSimilarity(product1, product2) {
  let score = 0;
  
  // 1. Price similarity (40% weight)
  // Closer prices = higher score
  const priceDiff = Math.abs(product1.price - product2.price);
  const maxPrice = Math.max(product1.price, product2.price);
  if (maxPrice > 0) {
    const priceScore = 1 - (priceDiff / maxPrice);
    score += priceScore * 0.4;
  }
  
  // 2. Subcategory match (30% weight)
  // Same subcategory = full points
  if (product1.subcategory && product2.subcategory && 
      product1.subcategory === product2.subcategory) {
    score += 0.3;
  }
  
  // 3. Size similarity (15% weight)
  // Same size = full points
  if (product1.size && product2.size && product1.size === product2.size) {
    score += 0.15;
  }
  
  // 4. Unit match (15% weight)
  // Same unit = full points
  if (product1.unit === product2.unit) {
    score += 0.15;
  }
  
  return score;
}

// Get similar products using KNN
export const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const k = parseInt(req.query.k) || 4; // Number of recommendations (default: 4)
    
    console.log(`Finding ${k} similar products for product ID: ${productId}`);
    
    // Get the current product
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    console.log(`Current product: ${currentProduct.name}, Category: ${currentProduct.category}`);
    
    // Get all products in the same category (excluding current product)
    const allProducts = await Product.find({
      _id: { $ne: productId }, // Exclude current product
      category: currentProduct.category, // Same category
      isActive: true, // Only active products
      quantity: { $gt: 0 } // Only in-stock products
    });
    
    console.log(`Found ${allProducts.length} potential similar products`);
    
    if (allProducts.length === 0) {
      return res.json({ 
        success: true, 
        recommendations: [],
        message: 'No similar products found'
      });
    }
    
    // Calculate similarity scores for all products
    const productsWithScores = allProducts.map(product => {
      const score = calculateSimilarity(currentProduct, product);
      return { 
        product, 
        score,
        // Include reasons for debugging/display
        reasons: {
          priceMatch: Math.abs(product.price - currentProduct.price) < currentProduct.price * 0.2,
          subcategoryMatch: product.subcategory === currentProduct.subcategory,
          sizeMatch: product.size === currentProduct.size,
          unitMatch: product.unit === currentProduct.unit
        }
      };
    });
    
    // Sort by similarity score (highest first) and get top K
    const recommendations = productsWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => ({
        ...item.product.toObject(),
        similarityScore: item.score,
        matchReasons: item.reasons
      }));
    
    console.log(`Returning ${recommendations.length} recommendations`);
    console.log('Top recommendation scores:', recommendations.map(r => r.similarityScore));
    
    res.json({ 
      success: true, 
      recommendations,
      currentProduct: {
        id: currentProduct._id,
        name: currentProduct.name,
        category: currentProduct.category
      }
    });
  } catch (error) {
    console.error('Error in getSimilarProducts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get similar products',
      error: error.message 
    });
  }
};

// Get personalized recommendations based on user's cart
export const getCartBasedRecommendations = async (req, res) => {
  try {
    const { cartItems } = req.body; // Array of product IDs in cart
    const k = parseInt(req.query.k) || 4;
    
    if (!cartItems || cartItems.length === 0) {
      return res.json({ 
        success: true, 
        recommendations: [],
        message: 'No cart items provided'
      });
    }
    
    // Get cart products
    const cartProducts = await Product.find({
      _id: { $in: cartItems },
      isActive: true
    });
    
    if (cartProducts.length === 0) {
      return res.json({ 
        success: true, 
        recommendations: [] 
      });
    }
    
    // Get categories from cart
    const cartCategories = [...new Set(cartProducts.map(p => p.category))];
    
    // Find products in same categories (excluding cart items)
    const allProducts = await Product.find({
      _id: { $nin: cartItems },
      category: { $in: cartCategories },
      isActive: true,
      quantity: { $gt: 0 }
    });
    
    // Calculate average similarity to all cart products
    const productsWithScores = allProducts.map(product => {
      const scores = cartProducts.map(cartProduct => 
        calculateSimilarity(cartProduct, product)
      );
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      return { product, score: avgScore };
    });
    
    // Get top K recommendations
    const recommendations = productsWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => ({
        ...item.product.toObject(),
        similarityScore: item.score
      }));
    
    res.json({ 
      success: true, 
      recommendations 
    });
  } catch (error) {
    console.error('Error in getCartBasedRecommendations:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get recommendations',
      error: error.message 
    });
  }
};

// Get trending/popular products (simple popularity-based)
export const getTrendingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const category = req.query.category;
    
    const query = {
      isActive: true,
      quantity: { $gt: 0 }
    };
    
    if (category) {
      query.category = category;
    }
    
    // Get products sorted by some popularity metric
    // For now, we'll use a combination of factors
    const products = await Product.find(query)
      .sort({ 
        featuredType: 1, // Featured products first
        createdAt: -1,   // Newer products
        price: -1        // Higher priced (premium)
      })
      .limit(limit);
    
    res.json({ 
      success: true, 
      products 
    });
  } catch (error) {
    console.error('Error in getTrendingProducts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get trending products',
      error: error.message 
    });
  }
};

export default {
  getSimilarProducts,
  getCartBasedRecommendations,
  getTrendingProducts
};

