import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },

    enquiryType: {
        type: String,
        enum: ["made-to-order", "custom-request"],
        required: true
    },

    // For 'made-to-order' enquiries, this references the catalog product
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },

    // Selected options from made-to-order 
    selectedOptions: {
        woodType: { type: String },
        dimensions: { type: String },
        quantity: { type: Number, min: 1, default: 1 },
        additionalNotes: { type: String }
    },

    // For 'custom-request' where they upload their own images
    customImages: [{
        url: { type: String },
        publicId: { type: String }
    }],
    customDescription: { type: String },

    status: {
        type: String,
        enum: ["Pending", "Under Review", "Quoted", "Accepted", "Rejected", "Converted to Order"],
        default: "Pending"
    },

    // Admin quotation details
    quote: {
        price: { type: Number, min: 0 },
        estimatedDeliveryTime: { type: String },
        adminRemarks: { type: String },
        quotedAt: { type: Date }
    },

    // Link to the generated order if accepted and converted
    convertedOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }
}, {
    timestamps: true
});

// Indexes
enquirySchema.index({ user: 1, createdAt: -1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ enquiryType: 1 });

const Enquiry = mongoose.model("Enquiry", enquirySchema);

export default Enquiry;
