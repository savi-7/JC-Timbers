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
      required: true,
      trim: true,
    },
    workType: {
      type: String,
      required: true,
      enum: ["Planing", "Resawing", "Debarking", "Sawing", "Other"],
      index: true,
    },
    woodType: {
      type: String,
      trim: true,
      default: "",
    },
    numberOfLogs: {
      type: Number,
      required: true,
      min: 1,
    },
    cubicFeet: {
      type: Number,
      required: true,
      min: 0.1,
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
