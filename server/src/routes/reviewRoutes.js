import express from 'express';
import {
  addReview,
  getMyReviews,
  updateMyReview,
  deleteMyReview,
  getProductReviews,
  canReviewProduct,
  adminGetReviews,
  adminUpdateReviewStatus,
  adminDeleteReview
} from '../controllers/reviewController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// ========== PUBLIC ROUTES ==========
// Get reviews for a product (approved only)
router.get('/product/:productId', getProductReviews);

// ========== CUSTOMER ROUTES (Authenticated) ==========
// Add a review
router.post('/', authenticateToken, addReview);

// Get my reviews
router.get('/my-reviews', authenticateToken, getMyReviews);

// Check if can review a product
router.get('/can-review', authenticateToken, canReviewProduct);

// Update my review
router.put('/:reviewId', authenticateToken, updateMyReview);

// Delete my review
router.delete('/:reviewId', authenticateToken, deleteMyReview);

// ========== ADMIN ROUTES ==========
// Get all reviews (with filters)
router.get('/admin/all', authenticateToken, authorizeAdmin, adminGetReviews);

// Update review status (approve/reject)
router.put('/admin/:reviewId/status', authenticateToken, authorizeAdmin, adminUpdateReviewStatus);

// Delete review
router.delete('/admin/:reviewId', authenticateToken, authorizeAdmin, adminDeleteReview);

export default router;

