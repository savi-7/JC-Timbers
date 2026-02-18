import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ["timber", "furniture", "construction"],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    enum: ["cubic ft", "pieces", "piece"],
    default: "pieces"
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  size: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  images: [{
    // Legacy: base64 data URL (when not using Cloudinary)
    data: { type: String },
    // Cloudinary: stored URL and public_id for delete
    url: { type: String },
    publicId: { type: String },
    contentType: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    }
  }],
  attributes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featuredType: {
    type: String,
    enum: ["best", "new", "discount", "none", "featured"],
    default: "none"
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Validate max 5 images and each image has either data (legacy) or url (Cloudinary)
productSchema.pre('save', function(next) {
  if (this.images && this.images.length > 5) {
    return next(new Error('Maximum 5 images allowed per product'));
  }
  if (this.images && this.images.length > 0) {
    const invalid = this.images.some(img => !img.data && !img.url);
    if (invalid) {
      return next(new Error('Each image must have either data or url'));
    }
  }
  next();
});

// Index for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ category: 1, subcategory: 1, isActive: 1 });
productSchema.index({ name: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featuredType: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;

