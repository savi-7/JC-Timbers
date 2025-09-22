import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // For Google users, password can be null
  password: { type: String, required: false, default: null },
  phone: { type: String, required: false },
  address: { type: String, required: false },
  role: { 
    type: String, 
    enum: ['admin', 'customer'], 
    default: 'customer',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lastLogin: { type: Date, default: null },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: [] }]
}, {
  timestamps: true  // This will automatically add createdAt and updatedAt fields
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);


