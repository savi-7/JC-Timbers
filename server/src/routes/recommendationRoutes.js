import express from 'express';
import { 
  getSimilarProducts, 
  getCartBasedRecommendations,
  getTrendingProducts 
} from '../controllers/recommendationController.js';

const router = express.Router();

// Get similar products for a specific product (KNN-based)
// GET /api/recommendations/similar/:productId?k=4
router.get('/similar/:productId', getSimilarProducts);

// Get recommendations based on cart items
// POST /api/recommendations/cart?k=4
// Body: { cartItems: ["productId1", "productId2"] }
router.post('/cart', getCartBasedRecommendations);

// Get trending/popular products
// GET /api/recommendations/trending?limit=8&category=timber
router.get('/trending', getTrendingProducts);

export default router;

