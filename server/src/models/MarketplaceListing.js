import mongoose from "mongoose";

const marketplaceListingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'used-like-new', 'used-good', 'fair']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  locationCoords: {
    lat: {
      type: Number,
      required: true
    },
    lon: {
      type: Number,
      required: true
    }
  },
  image: {
    data: { type: String },
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
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'sold', 'inactive'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplacePayment',
    default: null
  },
  paymentSlotIndex: {
    type: Number,
    default: null // Index of this listing in the payment (1, 2, or 3)
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

marketplaceListingSchema.pre("save", function (next) {
  if (this.image && !this.image.data && !this.image.url) {
    return next(new Error("Listing image must have either data or url"));
  }
  next();
});

// Index for better query performance
marketplaceListingSchema.index({ user: 1, status: 1 });
marketplaceListingSchema.index({ status: 1, createdAt: -1 });
marketplaceListingSchema.index({ category: 1, status: 1 });

export default mongoose.model("MarketplaceListing", marketplaceListingSchema);
