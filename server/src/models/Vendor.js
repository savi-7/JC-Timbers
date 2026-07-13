import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  contact: {
    email: { 
      type: String, 
      required: false,
      trim: true,
      lowercase: true
    },
    phone: { 
      type: String, 
      required: true,
      trim: true
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" }
    }
  },
  businessDetails: {
    gstNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },
    businessType: { 
      type: String, 
      enum: ['individual', 'company', 'partnership'],
      default: 'individual'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  totalIntake: {
    count: { type: Number, default: 0 },
    value: { type: Number, default: 0 }
  },
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
vendorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
