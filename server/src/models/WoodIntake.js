import mongoose from "mongoose";

const woodIntakeSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  woodDetails: {
    type: {
      type: String,
      required: true,
      enum: ['teak', 'rosewood', 'pine', 'oak', 'cedar', 'mahogany', 'bamboo', 'plywood', 'other'],
      trim: true
    },
    subtype: { type: String, trim: true }, // e.g., "premium teak", "grade A rosewood"
    dimensions: {
      length: { type: Number, required: true }, // in feet
      width: { type: Number, required: true },  // in inches
      thickness: { type: Number, required: true }, // in inches
      quantity: { type: Number, required: true } // number of pieces
    },
    quality: {
      type: String,
      enum: ['premium', 'grade_a', 'grade_b', 'standard'],
      default: 'standard'
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  },
  costDetails: {
    unitPrice: { type: Number, required: true }, // price per piece
    totalCost: { type: Number, required: true }, // total cost for all pieces
    currency: { type: String, default: 'INR' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'cheque', 'upi'],
      default: 'bank_transfer'
    }
  },
  logistics: {
    deliveryDate: { type: Date, required: true },
    deliveryMethod: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'delivery'
    },
    location: {
      warehouse: { type: String, trim: true },
      section: { type: String, trim: true },
      rack: { type: String, trim: true }
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'received', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
woodIntakeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total cost before validation
woodIntakeSchema.pre('validate', function(next) {
  if (this.woodDetails.dimensions.quantity && this.costDetails.unitPrice) {
    this.costDetails.totalCost = this.woodDetails.dimensions.quantity * this.costDetails.unitPrice;
  }
  next();
});

const WoodIntake = mongoose.model('WoodIntake', woodIntakeSchema);

export default WoodIntake;
