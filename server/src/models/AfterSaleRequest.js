import mongoose from "mongoose";

const externalProductDetailsSchema = new mongoose.Schema({
  name: { type: String },
  category: { type: String },
  estimatedAge: { type: String },
  notes: { type: String }
}, { _id: false });

const contactDetailsSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zip: { type: String }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  quotedAmount: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ["online", "offline", "waived", "pending"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "waived"],
    default: "unpaid"
  },
  transactionId: { type: String },
  paidAt: { type: Date }
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
  submittedAt: { type: Date }
}, { _id: false });

const afterSaleRequestSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  productOrigin: {
    type: String,
    enum: ["platform", "external"],
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  productName: { type: String },
  externalProductDetails: { type: externalProductDetailsSchema },
  serviceType: {
    type: String,
    enum: ["repair", "maintenance", "polishing", "restoration", "installation", "inspection", "warranty_claim"],
    required: true
  },
  issueDescription: { type: String, required: true, trim: true },
  issueImages: [{ type: String }],
  contactDetails: { type: contactDetailsSchema, required: true },
  address: { type: addressSchema },
  preferredDate: { type: Date },
  preferredTimeSlot: {
    type: String,
    enum: ["morning", "afternoon", "evening"],
    default: "morning"
  },
  status: {
    type: String,
    enum: ["submitted", "under_review", "scheduled", "in_progress", "completed", "closed", "rejected", "rescheduled"],
    default: "submitted"
  },
  warrantyEligible: { type: Boolean, default: false },
  assignedTechnicianName: { type: String },
  assignedTechnicianPhone: { type: String },
  scheduledDate: { type: Date },
  scheduledTimeSlot: { type: String },
  adminNotes: { type: String },
  rejectionReason: { type: String },
  completionImages: [{ type: String }],
  completionNotes: { type: String },
  invoice: { type: invoiceSchema, default: () => ({}) },
  feedback: { type: feedbackSchema }
}, {
  timestamps: true
});

const AfterSaleRequest = mongoose.model("AfterSaleRequest", afterSaleRequestSchema);

export default AfterSaleRequest;
