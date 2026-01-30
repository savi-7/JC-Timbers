import mongoose from "mongoose";

const serviceEnquirySchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      default: "",
    },
    phoneNumber: {
      type: String,
      required: false, // Optional - can be retrieved from user profile
      trim: true,
      default: "",
    },
    workType: {
      type: String,
      required: true,
      enum: ["Planing", "Resawing", "Debarking", "Sawing", "Other"],
      index: true,
    },
    // Array of log items - each item represents a different wood type/batch
    logItems: [{
      woodType: {
        type: String,
        required: true,
        trim: true,
      },
      numberOfLogs: {
        type: Number,
        required: true,
        min: 1,
      },
      thickness: {
        type: Number,
        required: true,
        min: 0,
      },
      width: {
        type: Number,
        required: true,
        min: 0,
      },
      length: {
        type: Number,
        required: true,
        min: 0,
      },
      cubicFeet: {
        type: Number,
        required: true,
        min: 0.1,
      },
    }],
    // Legacy fields for backward compatibility (deprecated, use logItems instead)
    woodType: {
      type: String,
      trim: true,
      default: "",
    },
    numberOfLogs: {
      type: Number,
      min: 1,
      default: null,
    },
    cubicFeet: {
      type: Number,
      required: true,
      min: 0.1,
    },
    // Derived processing details based on cubic feet
    processingHours: {
      type: Number, // Total processing time in hours (rounded up)
      min: 0,
      default: 0,
    },
    ratePerHour: {
      type: Number, // Billing rate per processing hour
      min: 0,
      default: 1200, // ₹1200 per hour
    },
    requestedDate: {
      type: Date,
      required: true,
      index: true,
    },
    requestedTime: {
      type: String, // Format: "HH:MM"
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    images: [{
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        default: "",
      },
    }],
    status: {
      type: String,
      enum: [
        "ENQUIRY_RECEIVED",
        "UNDER_REVIEW",
        "TIME_ACCEPTED",
        "ALTERNATE_TIME_PROPOSED",
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
      ],
      default: "ENQUIRY_RECEIVED",
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
    // Accepted time (when admin accepts requested time)
    acceptedDate: {
      type: Date,
      default: null,
    },
    acceptedStartTime: {
      type: String,
      default: null,
    },
    acceptedEndTime: {
      type: String,
      default: null,
    },
    // Proposed alternate time (when admin proposes different time)
    proposedDate: {
      type: Date,
      default: null,
    },
    proposedStartTime: {
      type: String,
      default: null,
    },
    proposedEndTime: {
      type: String,
      default: null,
    },
    // Final scheduled time (after confirmation)
    scheduledDate: {
      type: Date,
      default: null,
    },
    scheduledTime: {
      type: String,
      default: null,
    },
    assignedScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceSchedule",
      default: null,
    },
    estimatedCost: {
      type: Number,
      min: 0,
      default: null,
    },
    actualCost: {
      type: Number,
      min: 0,
      default: null,
    },
    // Payment tracking
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["NONE", "ONLINE", "OFFLINE"],
      default: "NONE",
    },
    razorpayOrderId: {
      type: String,
      trim: true,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      default: "",
    },
    razorpaySignature: {
      type: String,
      trim: true,
      default: "",
    },
    offlinePaymentNote: {
      type: String,
      trim: true,
      default: "",
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
serviceEnquirySchema.index({ customerId: 1, status: 1 });
serviceEnquirySchema.index({ status: 1, requestedDate: 1 });
serviceEnquirySchema.index({ createdAt: -1 });

const ServiceEnquiry = mongoose.model("ServiceEnquiry", serviceEnquirySchema);

export default ServiceEnquiry;
