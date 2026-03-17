import AfterSaleRequest from "../models/AfterSaleRequest.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import crypto from "crypto";

// Customer: Create a new after-sale request
export const createRequest = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const {
      productOrigin,
      orderId,
      productId,
      productName,
      externalProductDetails,
      serviceType,
      issueDescription,
      issueImages,
      contactDetails,
      address,
      preferredDate,
      preferredTimeSlot,
    } = req.body;

    if (!productOrigin || !serviceType || !issueDescription || !contactDetails) {
      return res.status(400).json({
        message: "productOrigin, serviceType, issueDescription, and contactDetails are required",
      });
    }

    if (!["platform", "external"].includes(productOrigin)) {
      return res.status(400).json({
        message: "productOrigin must be platform or external",
      });
    }

    const validServiceTypes = [
      "repair",
      "maintenance",
      "polishing",
      "restoration",
      "installation",
      "inspection",
      "warranty_claim",
    ];
    if (!validServiceTypes.includes(serviceType)) {
      return res.status(400).json({
        message: "Invalid serviceType",
      });
    }

    if (
      !contactDetails.fullName ||
      !contactDetails.phoneNumber ||
      !contactDetails.email
    ) {
      return res.status(400).json({
        message: "contactDetails must include fullName, phoneNumber, and email",
      });
    }

    const requestData = {
      customerId: userId,
      productOrigin,
      serviceType,
      issueDescription: issueDescription.trim(),
      contactDetails: {
        fullName: contactDetails.fullName.trim(),
        phoneNumber: contactDetails.phoneNumber.trim(),
        email: contactDetails.email.trim(),
      },
      orderId: productOrigin === "platform" ? orderId : undefined,
      productId: productOrigin === "platform" ? productId : undefined,
      productName: productName || undefined,
      externalProductDetails:
        productOrigin === "external" ? externalProductDetails : undefined,
      issueImages: Array.isArray(issueImages) ? issueImages : [],
      address: address || undefined,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      preferredTimeSlot: preferredTimeSlot || "morning",
    };

    const request = new AfterSaleRequest(requestData);

    if (productOrigin === "platform" && productId && orderId) {
      const product = await Product.findById(productId).lean();
      const order = await Order.findById(orderId).lean();
      if (product && order && product.warrantyIncluded && product.warrantyMonths > 0) {
        const orderCreated = new Date(order.createdAt);
        const warrantyEnd = new Date(orderCreated);
        warrantyEnd.setMonth(warrantyEnd.getMonth() + (product.warrantyMonths || 0));
        if (new Date() <= warrantyEnd) {
          request.warrantyEligible = true;
          if (!request.invoice) request.invoice = {};
          request.invoice.paymentStatus = "waived";
          request.invoice.paymentMethod = "waived";
        }
      }
    }

    if (productOrigin === "external") {
      request.warrantyEligible = false;
    }

    await request.save();

    res.status(201).json(request);
  } catch (error) {
    console.error("Error creating after-sale request:", error);
    res.status(500).json({
      message: "Failed to create after-sale request",
      error: error.message,
    });
  }
};

// Customer: Get my after-sale requests
export const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const requests = await AfterSaleRequest.find({ customerId: userId })
      .sort({ createdAt: -1 })
      .populate("productId", "name images")
      .lean();

    res.json(requests);
  } catch (error) {
    console.error("Error fetching my after-sale requests:", error);
    res.status(500).json({
      message: "Failed to fetch after-sale requests",
      error: error.message,
    });
  }
};

// Customer or Admin: Get single request by ID (ownership or admin)
export const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await AfterSaleRequest.findById(id)
      .populate("productId", "name images")
      .populate("orderId")
      .lean();

    if (!request) {
      return res.status(404).json({ message: "After-sale request not found" });
    }

    const userId = req.user.userId || req.user.id;
    const isOwner =
      request.customerId &&
      request.customerId.toString() === userId.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(request);
  } catch (error) {
    console.error("Error fetching after-sale request:", error);
    res.status(500).json({
      message: "Failed to fetch after-sale request",
      error: error.message,
    });
  }
};

// Customer: Cancel request (only if status is submitted)
export const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const request = await AfterSaleRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "After-sale request not found" });
    }

    if (request.customerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (request.status !== "submitted") {
      return res.status(400).json({
        message: "Only submitted requests can be cancelled",
      });
    }

    request.status = "closed";
    request.adminNotes = "cancelled by customer";
    await request.save();

    res.json(request);
  } catch (error) {
    console.error("Error cancelling after-sale request:", error);
    res.status(500).json({
      message: "Failed to cancel after-sale request",
      error: error.message,
    });
  }
};

// Customer: Submit feedback (only when status is completed, once only)
export const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId || req.user.id;

    const request = await AfterSaleRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "After-sale request not found" });
    }

    if (request.customerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (request.status !== "completed") {
      return res.status(400).json({
        message: "Feedback can only be submitted for completed requests",
      });
    }

    if (request.feedback && request.feedback.rating != null) {
      return res.status(400).json({
        message: "Feedback has already been submitted",
      });
    }

    request.feedback = {
      rating: rating != null ? Number(rating) : undefined,
      comment: comment || undefined,
      submittedAt: new Date(),
    };
    await request.save();

    res.json(request);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};

// Admin: Get all requests with optional filters and pagination
export const adminGetAllRequests = async (req, res) => {
  try {
    const { status, productOrigin, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (productOrigin) filter.productOrigin = productOrigin;

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [requests, totalCount] = await Promise.all([
      AfterSaleRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("customerId", "name email")
        .populate("productId", "name images")
        .lean(),
      AfterSaleRequest.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      requests,
      totalCount,
      page: parseInt(page, 10),
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching after-sale requests (admin):", error);
    res.status(500).json({
      message: "Failed to fetch after-sale requests",
      error: error.message,
    });
  }
};

// Admin: Update status and optionally adminNotes, rejectionReason, completion fields
export const adminUpdateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      adminNotes,
      rejectionReason,
      completionNotes,
      completionImages,
    } = req.body;

    const request = await AfterSaleRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "After-sale request not found" });
    }

    if (status !== undefined) request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    if (rejectionReason !== undefined) request.rejectionReason = rejectionReason;

    if (request.status === "completed") {
      if (completionNotes !== undefined) request.completionNotes = completionNotes;
      if (completionImages !== undefined)
        request.completionImages = Array.isArray(completionImages)
          ? completionImages
          : request.completionImages;
    }

    await request.save();

    res.json(request);
  } catch (error) {
    console.error("Error updating after-sale status:", error);
    res.status(500).json({
      message: "Failed to update after-sale request",
      error: error.message,
    });
  }
};

// Admin: Assign technician and set status to scheduled
export const adminAssignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      assignedTechnicianName,
      assignedTechnicianPhone,
      scheduledDate,
      scheduledTimeSlot,
    } = req.body;

    const request = await AfterSaleRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "After-sale request not found" });
    }

    if (assignedTechnicianName !== undefined)
      request.assignedTechnicianName = assignedTechnicianName;
    if (assignedTechnicianPhone !== undefined)
      request.assignedTechnicianPhone = assignedTechnicianPhone;
    if (scheduledDate !== undefined)
      request.scheduledDate = new Date(scheduledDate);
    if (scheduledTimeSlot !== undefined)
      request.scheduledTimeSlot = scheduledTimeSlot;

    request.status = "scheduled";
    await request.save();

    res.json(request);
  } catch (error) {
    console.error("Error assigning technician:", error);
    res.status(500).json({
      message: "Failed to assign technician",
      error: error.message,
    });
  }
};

// Admin: Set quote (and enforce waived if warrantyEligible)
export const adminSetQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { quotedAmount } = req.body;

    const request = await AfterSaleRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "After-sale request not found" });
    }

    if (!request.invoice) request.invoice = {};
    if (quotedAmount !== undefined)
      request.invoice.quotedAmount = Number(quotedAmount);

    if (request.warrantyEligible) {
      request.invoice.paymentStatus = "waived";
      request.invoice.paymentMethod = "waived";
    } else {
      request.invoice.paymentStatus = "unpaid";
    }

    await request.save();

    res.json(request);
  } catch (error) {
    console.error("Error setting quote:", error);
    res.status(500).json({
      message: "Failed to set quote",
      error: error.message,
    });
  }
};

// Customer: Confirm online payment (Razorpay verification)
export const confirmOnlinePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;
    const razorpayPaymentId =
      req.body.razorpayPaymentId || req.body.razorpay_payment_id;
    const razorpayOrderId =
      req.body.razorpayOrderId || req.body.razorpay_order_id;
    const razorpaySignature =
      req.body.razorpaySignature || req.body.razorpay_signature;

    const request = await AfterSaleRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "After-sale request not found" });
    }

    if (request.customerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({
        message: "razorpayPaymentId, razorpayOrderId, and signature are required",
      });
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    if (!request.invoice) request.invoice = {};
    request.invoice.paymentMethod = "online";
    request.invoice.paymentStatus = "paid";
    request.invoice.transactionId = razorpayPaymentId;
    request.invoice.paidAt = new Date();
    await request.save();

    res.json(request);
  } catch (error) {
    console.error("Error confirming online payment:", error);
    res.status(500).json({
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Admin: Mark request as paid offline
export const adminMarkOfflinePaid = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await AfterSaleRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "After-sale request not found" });
    }

    if (!request.invoice) request.invoice = {};
    request.invoice.paymentMethod = "offline";
    request.invoice.paymentStatus = "paid";
    request.invoice.paidAt = new Date();
    await request.save();

    res.json(request);
  } catch (error) {
    console.error("Error marking offline paid:", error);
    res.status(500).json({
      message: "Failed to mark as paid",
      error: error.message,
    });
  }
};

// Admin: Get analytics aggregations
export const adminGetAnalytics = async (req, res) => {
  try {
    const [totalRequestsResult, byStatus, byProductOrigin, byPaymentMethod, averageRatingResult, totalRevenueResult] =
      await Promise.all([
        AfterSaleRequest.countDocuments(),
        AfterSaleRequest.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        AfterSaleRequest.aggregate([
          { $group: { _id: "$productOrigin", count: { $sum: 1 } } },
        ]),
        AfterSaleRequest.aggregate([
          { $group: { _id: "$invoice.paymentMethod", count: { $sum: 1 } } },
        ]),
        AfterSaleRequest.aggregate([
          {
            $match: {
              "feedback.rating": { $exists: true, $ne: null },
            },
          },
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$feedback.rating" },
            },
          },
        ]),
        AfterSaleRequest.aggregate([
          {
            $match: { "invoice.paymentStatus": "paid" },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$invoice.quotedAmount" },
            },
          },
        ]),
      ]);

    const totalRequests = totalRequestsResult;
    const averageRating =
      averageRatingResult[0]?.averageRating != null
        ? averageRatingResult[0].averageRating
        : null;
    const totalRevenue =
      totalRevenueResult[0]?.totalRevenue != null
        ? totalRevenueResult[0].totalRevenue
        : 0;

    res.json({
      totalRequests,
      byStatus,
      byProductOrigin,
      byPaymentMethod,
      averageRating,
      totalRevenue,
    });
  } catch (error) {
    console.error("Error fetching after-sale analytics:", error);
    res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};
