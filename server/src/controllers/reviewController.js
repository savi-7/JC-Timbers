import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Customer: Add a review (any registered customer can review)
export const addReview = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId, rating, reviewTitle, reviewerName, reviewText } = req.body;
    
    // Validation
    if (!productId || !rating || !reviewTitle || !reviewerName) {
      return res.status(400).json({ message: 'Product ID, rating, review title, and name are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    if (reviewTitle.trim().length < 3 || reviewTitle.trim().length > 100) {
      return res.status(400).json({ message: 'Review title must be between 3 and 100 characters' });
    }
    
    if (reviewerName.trim().length < 2 || reviewerName.trim().length > 100) {
      return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
    }
    
    // Check if review already exists for this product and user
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    // Handle image uploads if provided
    const images = [];
    if (req.body.images && Array.isArray(req.body.images)) {
      req.body.images.forEach((img, index) => {
        if (img.data && img.contentType) {
          images.push({
            data: img.data,
            contentType: img.contentType,
            filename: img.filename || `review-image-${index}`
          });
        }
      });
    }
    
    // Create review
    const review = await Review.create({
      product: productId,
      user: userId,
      order: null, // No order required - open reviews
      rating,
      reviewTitle: reviewTitle.trim(),
      reviewerName: reviewerName.trim(),
      reviewText: reviewText ? reviewText.trim() : '',
      images,
      status: 'Pending' // All reviews start as pending
    });
    
    console.log(`✅ New review added by user ${userId} for product ${productId}`);
    
    // Note: Product rating is NOT updated yet - only after admin approval
    // await updateProductRating(productId);
    
    return res.status(201).json({
      message: 'Review submitted successfully! It will appear after admin approval.',
      review
    });
  } catch (error) {
    console.error('Add review error:', error);
    return res.status(500).json({ message: 'Failed to add review', error: error.message });
  }
};

// Customer: Get my reviews
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const reviews = await Review.find({ user: userId })
      .populate('product', 'name price images')
      .populate('order', '_id createdAt')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(reviews);
  } catch (error) {
    console.error('Get my reviews error:', error);
    return res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

// Customer: Update my review
export const updateMyReview = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { reviewId } = req.params;
    const { rating, reviewTitle, reviewerName, reviewText, images } = req.body;
    
    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or does not belong to you' });
    }
    
    // Update fields
    if (rating && rating >= 1 && rating <= 5) {
      review.rating = rating;
    }
    if (reviewTitle && reviewTitle.trim().length >= 3) {
      review.reviewTitle = reviewTitle.trim();
    }
    if (reviewerName && reviewerName.trim().length >= 2) {
      review.reviewerName = reviewerName.trim();
    }
    if (reviewText !== undefined) {
      review.reviewText = reviewText.trim();
    }
    if (images && Array.isArray(images)) {
      review.images = images.filter(img => img.data && img.contentType);
    }
    
    // Set status back to Pending if edited
    if (review.status === 'Approved') {
      review.status = 'Pending';
    }
    
    await review.save();
    
    // Update product rating
    await updateProductRating(review.product);
    
    console.log(`✅ Review ${reviewId} updated by user ${userId}`);
    
    return res.status(200).json({
      message: 'Review updated successfully. It will be reviewed by admin again.',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    return res.status(500).json({ message: 'Failed to update review', error: error.message });
  }
};

// Customer: Delete my review
export const deleteMyReview = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { reviewId } = req.params;
    
    const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or does not belong to you' });
    }
    
    // Update product rating
    await updateProductRating(review.product);
    
    console.log(`✅ Review ${reviewId} deleted by user ${userId}`);
    
    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
};

// Public: Get reviews for a product (only approved)
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.find({ product: productId, status: 'Approved' })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments({ product: productId, status: 'Approved' });
    
    // Calculate rating stats
    const allReviews = await Review.find({ product: productId, status: 'Approved' });
    const stats = {
      total: allReviews.length,
      average: allReviews.length > 0 
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : 0,
      distribution: {
        5: allReviews.filter(r => r.rating === 5).length,
        4: allReviews.filter(r => r.rating === 4).length,
        3: allReviews.filter(r => r.rating === 3).length,
        2: allReviews.filter(r => r.rating === 2).length,
        1: allReviews.filter(r => r.rating === 1).length
      }
    };
    
    return res.status(200).json({
      reviews,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    return res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

// Check if user can review a product
export const canReviewProduct = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId } = req.query;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(200).json({ 
        canReview: false, 
        message: 'Already reviewed',
        review: existingReview
      });
    }
    
    // Any registered user can review
    return res.status(200).json({ canReview: true });
  } catch (error) {
    console.error('Can review product error:', error);
    return res.status(500).json({ message: 'Failed to check review status', error: error.message });
  }
};

// ============= ADMIN FUNCTIONS =============

// Admin: Get all reviews
export const adminGetReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
      filter.status = status;
    }
    
    const reviews = await Review.find(filter)
      .populate('product', 'name')
      .populate('user', 'name email')
      .populate('order', '_id createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments(filter);
    
    // Get counts by status
    const pendingCount = await Review.countDocuments({ status: 'Pending' });
    const approvedCount = await Review.countDocuments({ status: 'Approved' });
    const rejectedCount = await Review.countDocuments({ status: 'Rejected' });
    
    return res.status(200).json({
      reviews,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount
      }
    });
  } catch (error) {
    console.error('Admin get reviews error:', error);
    return res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

// Admin: Update review status
export const adminUpdateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, adminResponse } = req.body;
    
    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.status = status;
    if (adminResponse) {
      review.adminResponse = adminResponse;
      review.respondedAt = new Date();
    }
    
    await review.save();
    
    // Update product rating
    await updateProductRating(review.product);
    
    console.log(`✅ Review ${reviewId} status updated to ${status}`);
    
    return res.status(200).json({
      message: `Review ${status.toLowerCase()} successfully`,
      review
    });
  } catch (error) {
    console.error('Admin update review status error:', error);
    return res.status(500).json({ message: 'Failed to update review status', error: error.message });
  }
};

// Admin: Delete review
export const adminDeleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Update product rating
    await updateProductRating(review.product);
    
    console.log(`✅ Review ${reviewId} deleted by admin`);
    
    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Admin delete review error:', error);
    return res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
};

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const approvedReviews = await Review.find({ product: productId, status: 'Approved' });
    
    if (approvedReviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0
      });
      return;
    }
    
    const averageRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(averageRating.toFixed(1)),
      reviewCount: approvedReviews.length
    });
    
    console.log(`✅ Updated product ${productId} rating: ${averageRating.toFixed(1)} (${approvedReviews.length} reviews)`);
  } catch (error) {
    console.error('Update product rating error:', error);
  }
}

export default {
  addReview,
  getMyReviews,
  updateMyReview,
  deleteMyReview,
  getProductReviews,
  canReviewProduct,
  adminGetReviews,
  adminUpdateReviewStatus,
  adminDeleteReview
};

