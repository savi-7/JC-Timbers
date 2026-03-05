import Product from '../models/Product.js';
import axios from 'axios';
import FormData from 'form-data';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

/**
 * KNN-style similarity scoring focused on:
 * - Category: filtered before scoring (same category preferred)
 * - Price distance: closer price = higher score
 * - "Type" (subcategory / key attribute): same type boosts score
 */

// Derive a logical "type" for a product from available fields
function getLogicalType(product) {
  if (!product) return null;
  return (
    product.subcategory ||
    product.attributes?.woodType ||
    product.attributes?.furnitureType ||
    product.attributes?.productType ||
    null
  );
}

// Try to get a base64 image string for a product (for image-based KNN)
function getPrimaryImageBase64(product) {
  if (!product || !product.images || product.images.length === 0) return null;

  // Prefer images that already have base64 data stored
  const withData = product.images.find(img => img.data);
  const primary = withData || product.images[0];

  if (primary.data) {
    // If it's already a data URL, return as-is
    if (primary.data.startsWith('data:')) {
      return primary.data;
    }
    // Otherwise, wrap raw base64 with a data URL prefix
    const contentType = primary.contentType || 'image/jpeg';
    return `data:${contentType};base64,${primary.data}`;
  }

  // If there is only a URL (e.g. Cloudinary) and no data stored, we skip
  // image-based search to avoid extra network + encoding work here.
  return null;
}

// Calculate similarity score between two products based on price + logical type
// maxPriceDiffInSet: precomputed max |price1 - price2| across all candidates vs the anchor product
function calculateSimilarity(product1, product2, maxPriceDiffInSet = null) {
  const price1 = Number(product1?.price) || 0;
  const price2 = Number(product2?.price) || 0;
  const priceDiff = Math.abs(price1 - price2);

  let score = 0;

  // 1) Price similarity (70% weight)
  if (maxPriceDiffInSet && maxPriceDiffInSet > 0) {
    const priceScore = 1 - priceDiff / maxPriceDiffInSet;
    score += Math.max(0, priceScore) * 0.7;
  } else {
    const maxPrice = Math.max(price1, price2);
    if (maxPrice > 0) {
      const priceScore = 1 - priceDiff / maxPrice;
      score += Math.max(0, priceScore) * 0.7;
    }
  }

  // 2) Logical "type" match (30% weight)
  const type1 = getLogicalType(product1);
  const type2 = getLogicalType(product2);
  if (type1 && type2 && type1 === type2) {
    score += 0.3;
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

    // === 1) For furniture, try image-based KNN via FastAPI + Pinecone ===
    if (currentProduct.category === 'furniture') {
      const imageBase64 = getPrimaryImageBase64(currentProduct);

      if (imageBase64 && FASTAPI_URL) {
        try {
          const topK = Math.min((k || 4) * 2, 12); // ask for a few extra, then trim to k

          const formData = new FormData();
          formData.append('image_base64', imageBase64);
          formData.append('top_k', topK.toString());

          console.log('Calling image search service for furniture KNN recommendations...');

          const response = await axios.post(
            `${FASTAPI_URL}/search-by-image-base64`,
            formData,
            {
              headers: {
                ...formData.getHeaders()
              },
              timeout: 30000
            }
          );

          const results = response.data?.results || response.data?.data?.results || [];

          const productIds = results
            .map(r => r.product_id)
            .filter(id => id && id.toString() !== productId.toString());

          if (productIds.length > 0) {
            const products = await Product.find({
              _id: { $in: productIds },
              isActive: true,
              quantity: { $gt: 0 }
            });

            const productMap = new Map(products.map(p => [p._id.toString(), p]));

            const recommendations = productIds
              .map(id => {
                const prod = productMap.get(id.toString());
                if (!prod) return null;
                const match = results.find(r => r.product_id === id);
                return {
                  ...prod.toObject(),
                  similarityScore: match?.score ?? 0,
                  matchReasons: {
                    imageMatch: true,
                    imageScore: match?.score ?? 0,
                    sameCategory: prod.category === currentProduct.category
                  }
                };
              })
              .filter(Boolean)
              .slice(0, k);

            if (recommendations.length > 0) {
              console.log(
                `Returning ${recommendations.length} image-based furniture recommendations (scores:`,
                recommendations.map(r => r.similarityScore),
                ')'
              );

              return res.json({
                success: true,
                recommendations,
                currentProduct: {
                  id: currentProduct._id,
                  name: currentProduct.name,
                  category: currentProduct.category
                }
              });
            }
          }

          console.log('Image-based search returned no usable furniture recommendations, falling back to price/type KNN.');
        } catch (err) {
          console.warn('Image-based KNN failed, falling back to price/type KNN:', err.message);
        }
      } else {
        console.log('No base64 image available for current product; skipping image-based KNN.');
      }
    }

    // === 2) Fallback: price + type KNN within same category ===
    // Prefer products from the same category (excluding current product)
    let candidates = await Product.find({
      _id: { $ne: productId },
      category: currentProduct.category,
      isActive: true,
      quantity: { $gt: 0 }
    });

    const sameCategoryAvailable = candidates.length > 0;
    console.log(`Found ${candidates.length} potential similar products in same category`);

    // 2) Fallback: if no products in same category, use all active in-stock products (other categories allowed)
    if (!sameCategoryAvailable) {
      candidates = await Product.find({
        _id: { $ne: productId },
        isActive: true,
        quantity: { $gt: 0 }
      });
      console.log(`No same-category products found. Using ${candidates.length} cross-category candidates.`);
    }

    if (candidates.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        message: 'No similar products found'
      });
    }

    // Pre-compute max price difference within this candidate set for better normalization
    const priceDiffs = candidates
      .map(p => Math.abs(Number(p.price || 0) - Number(currentProduct.price || 0)))
      .filter(d => Number.isFinite(d));
    const maxPriceDiffInSet = priceDiffs.length > 0 ? Math.max(...priceDiffs) || 1 : 1;

    // Calculate similarity scores for all products
    const productsWithScores = candidates.map(product => {
      const score = calculateSimilarity(currentProduct, product, maxPriceDiffInSet);
      const priceDiff = Math.abs(Number(product.price || 0) - Number(currentProduct.price || 0));
      const type1 = getLogicalType(currentProduct);
      const type2 = getLogicalType(product);
      return {
        product,
        score,
        reasons: {
          priceMatch: maxPriceDiffInSet > 0
            ? priceDiff <= maxPriceDiffInSet * 0.25
            : (Number(currentProduct.price || 0) > 0
              ? priceDiff <= Number(currentProduct.price || 0) * 0.2
              : false),
          sameCategory: product.category === currentProduct.category,
          sameType: !!(type1 && type2 && type1 === type2)
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

