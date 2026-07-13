import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false // Made optional - can review without purchase
  },
  reviewTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  reviewerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  images: [{
    data: String, // Base64 encoded image
    contentType: String,
    filename: String
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  helpful: {
    type: Number,
    default: 0
  },
  adminResponse: {
    type: String,
    trim: true,
    maxlength: 500
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ status: 1 });

// Ensure user can only review a product once (regardless of purchase)
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);

