import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
faqSchema.index({ category: 1, order: 1 });

export default mongoose.model('FAQ', faqSchema);




