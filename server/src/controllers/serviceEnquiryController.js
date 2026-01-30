import ServiceEnquiry from "../models/ServiceEnquiry.js";
import ServiceSchedule from "../models/ServiceSchedule.js";
import Holiday from "../models/Holiday.js";
import User from "../models/User.js";
import path from "path";
import { convertImageToBase64 } from "../middleware/upload.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Lazy initialization of Razorpay instance specifically for service enquiries
const getRazorpayInstanceForServices = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay credentials not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env file"
    );
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Customer: Submit a new service enquiry
export const createEnquiry = async (req, res) => {
  try {
    // Authentication should already be handled by authenticateToken middleware
    // This check is a safety net
    if (!req.user || !req.user.userId) {
      console.error('❌ CRITICAL: req.user not set in controller!');
      console.error('This should not happen - auth middleware should have caught this');
      console.error('Request details:', {
        path: req.path,
        method: req.method,
        url: req.url,
        headers: Object.keys(req.headers),
        hasAuthHeader: !!req.headers.authorization
      });
      return res.status(401).json({
        message: "Authentication required",
      });
    }
    
    console.log('📝 Create enquiry - Controller reached successfully');
    console.log('req.user:', { userId: req.user.userId, role: req.user.role });

    console.log('📝 Create enquiry request received:', {
      userId: req.user.userId,
      userRole: req.user.role,
      body: { ...req.body, images: req.files?.length || 0 }
    });

    const {
      workType,
      logItems, // Array of log items (will be JSON string from FormData)
      cubicFeet, // Total cubic feet
      requestedDate,
      requestedTime,
      phoneNumber,
      name,
      notes,
    } = req.body;

    // Parse logItems if it's a string (from FormData)
    let parsedLogItems = [];
    if (logItems) {
      try {
        parsedLogItems = typeof logItems === 'string' ? JSON.parse(logItems) : logItems;
      } catch (error) {
        return res.status(400).json({
          message: "Invalid log items format",
        });
      }
    }

    // Validate required fields
    if (!workType || !requestedDate || !requestedTime) {
      return res.status(400).json({
        message: "Work type, requested date, and requested time are required",
      });
    }

    // Validate logItems array
    if (!parsedLogItems || !Array.isArray(parsedLogItems) || parsedLogItems.length === 0) {
      return res.status(400).json({
        message: "At least one log entry is required",
      });
    }

    // Validate each log item
    for (let i = 0; i < parsedLogItems.length; i++) {
      const item = parsedLogItems[i];
      if (!item.woodType || !item.numberOfLogs || !item.cubicFeet) {
        return res.status(400).json({
          message: `Log entry ${i + 1}: Wood type, number of logs, and cubic feet are required`,
        });
      }
      if (parseInt(item.numberOfLogs) < 1) {
        return res.status(400).json({
          message: `Log entry ${i + 1}: Number of logs must be at least 1`,
        });
      }
      if (parseFloat(item.cubicFeet) < 0.1) {
        return res.status(400).json({
          message: `Log entry ${i + 1}: Cubic feet must be at least 0.1`,
        });
      }
    }

    // Calculate total cubic feet from all log items
    const totalCubicFeet = parsedLogItems.reduce((sum, item) => {
      return sum + (parseFloat(item.cubicFeet) || 0);
    }, 0);

    // Use provided cubicFeet or calculated total
    const finalCubicFeet = cubicFeet ? parseFloat(cubicFeet) : totalCubicFeet;

    if (finalCubicFeet < 0.1) {
      return res.status(400).json({
        message: "Total cubic feet must be at least 0.1",
      });
    }

    // Validate work type
    const validWorkTypes = ["Planing", "Resawing", "Debarking", "Sawing", "Other"];
    if (!validWorkTypes.includes(workType)) {
      return res.status(400).json({
        message: "Invalid work type",
      });
    }

    // Check if the requested date is a holiday
    const requestedDateObj = new Date(requestedDate);
    requestedDateObj.setHours(0, 0, 0, 0);
    const holidayStart = new Date(requestedDateObj);
    holidayStart.setHours(0, 0, 0, 0);
    const holidayEnd = new Date(requestedDateObj);
    holidayEnd.setHours(23, 59, 59, 999);
    
    const holiday = await Holiday.findOne({
      date: {
        $gte: holidayStart,
        $lte: holidayEnd
      }
    });
    
    if (holiday) {
      return res.status(400).json({
        message: `This date is a holiday: ${holiday.name}. No services are available on this date. Please select another date.`
      });
    }
    
    // Calculate end time (default 2 hours)
    const [startHour, startMin] = requestedTime.split(':').map(Number);
    const duration = 120; // 2 hours default
    const totalMinutes = startHour * 60 + startMin + duration;
    const endHour = Math.floor(totalMinutes / 60);
    const endMin = totalMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    
    // Check for overlapping schedule blocks
    const allScheduleBlocks = await ServiceSchedule.find({
      date: requestedDateObj.getTime(),
      status: { $ne: "cancelled" },
    });
    
    const overlappingSchedule = allScheduleBlocks.find(slot => {
      // Check if requested time overlaps with existing slot
      return (requestedTime >= slot.startTime && requestedTime < slot.endTime) ||
             (endTime > slot.startTime && endTime <= slot.endTime) ||
             (requestedTime <= slot.startTime && endTime >= slot.endTime);
    });
    
    if (overlappingSchedule) {
      return res.status(409).json({
        message: `The requested time slot (${requestedTime} - ${endTime}) is already booked. Please choose another time.`,
        conflictingSlot: {
          startTime: overlappingSchedule.startTime,
          endTime: overlappingSchedule.endTime
        }
      });
    }
    
    // Check for overlapping scheduled enquiries
    const targetDateEnd = new Date(requestedDateObj);
    targetDateEnd.setHours(23, 59, 59, 999);
    
    const allScheduledEnquiries = await ServiceEnquiry.find({
      $or: [
        {
          scheduledDate: {
            $gte: requestedDateObj,
            $lt: targetDateEnd
          },
          scheduledTime: { $exists: true, $ne: null },
          status: { $in: ["SCHEDULED", "TIME_ACCEPTED", "IN_PROGRESS"] }
        },
        {
          acceptedDate: {
            $gte: requestedDateObj,
            $lt: targetDateEnd
          },
          acceptedStartTime: { $exists: true, $ne: null },
          status: { $in: ["TIME_ACCEPTED", "SCHEDULED", "IN_PROGRESS"] }
        }
      ]
    })
    .populate('assignedScheduleId', 'startTime endTime duration');
    
    const overlappingEnquiry = allScheduledEnquiries.find(enquiry => {
      const conflictStart = enquiry.acceptedStartTime || enquiry.scheduledTime;
      if (!conflictStart) return false;
      
      // Priority 1: Use acceptedEndTime if available (set by admin with actual duration)
      let conflictEnd = enquiry.acceptedEndTime;
      
      // Priority 2: If no acceptedEndTime, check if there's an assigned schedule (populated)
      if (!conflictEnd && enquiry.assignedScheduleId && enquiry.assignedScheduleId.endTime) {
        conflictEnd = enquiry.assignedScheduleId.endTime;
      }
      
      // Last resort: if still no end time, use start time (shouldn't happen for scheduled enquiries)
      if (!conflictEnd) {
        conflictEnd = conflictStart;
      }
      
      // Check if requested time overlaps with enquiry time
      return (requestedTime >= conflictStart && requestedTime < conflictEnd) ||
             (endTime > conflictStart && endTime <= conflictEnd) ||
             (requestedTime <= conflictStart && endTime >= conflictEnd);
    });
    
    if (overlappingEnquiry) {
      const conflictTime = overlappingEnquiry.acceptedStartTime || overlappingEnquiry.scheduledTime;
      // Use the actual stored end time (set by admin with duration)
      let conflictEnd = overlappingEnquiry.acceptedEndTime;
      if (!conflictEnd && overlappingEnquiry.assignedScheduleId && overlappingEnquiry.assignedScheduleId.endTime) {
        conflictEnd = overlappingEnquiry.assignedScheduleId.endTime;
      }
      if (!conflictEnd) {
        conflictEnd = conflictTime;
      }
      
      return res.status(409).json({
        message: `The requested time slot (${requestedTime} - ${endTime}) conflicts with an existing booking (${conflictTime} - ${conflictEnd}). Please choose another time.`,
        conflictingSlot: {
          startTime: conflictTime,
          endTime: conflictEnd
        }
      });
    }

    // Get user details - allow both customer and admin roles
    const customer = await User.findById(req.user.userId);
    if (!customer) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Allow both customers and admins to create enquiries
    // No role restriction - any authenticated user can create an enquiry

    // Process uploaded images
    const imageArray = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Convert image to base64 for storage
        const base64Data = convertImageToBase64(file.path);
        if (base64Data) {
          // Store image URL (in production, you'd upload to cloud storage)
          // For now, we'll use base64 data URI
          const imageUrl = `data:${file.mimetype};base64,${base64Data}`;
          imageArray.push({
            url: imageUrl,
            public_id: file.filename,
          });
        }
      }
    }

    // Prepare log items for storage (ensure all fields are properly formatted)
    const logItemsToStore = parsedLogItems.map(item => ({
      woodType: item.woodType,
      numberOfLogs: parseInt(item.numberOfLogs),
      thickness: parseFloat(item.thickness) || 0,
      width: parseFloat(item.width) || 0,
      length: parseFloat(item.length) || 0,
      cubicFeet: parseFloat(item.cubicFeet),
    }));

    // Derive processing time and estimated cost
    // Time: every 10 cubic feet = 1 hour, rounded UP to the next full hour
    const processingHours = finalCubicFeet > 0 ? Math.ceil(finalCubicFeet / 10) : 0;
    const ratePerHour = 1200; // ₹1200 per hour
    const ratePerCubicFoot = ratePerHour / 10; // ₹120 per cubic foot
    // Cost scales exactly with cubic feet (e.g. 5 cu ft = 600, 15 cu ft = 1800)
    const estimatedCost = finalCubicFeet * ratePerCubicFoot;

    // Create enquiry
    const enquiry = new ServiceEnquiry({
      customerId: req.user.userId,
      customerName: name || customer.name || "Customer",
      customerEmail: customer.email || "",
      phoneNumber: phoneNumber || customer.phone || "",
      workType,
      logItems: logItemsToStore,
      cubicFeet: finalCubicFeet, // Total cubic feet
      processingHours,
      ratePerHour,
      estimatedCost,
      requestedDate: new Date(requestedDate),
      requestedTime,
      notes: notes || "",
      images: imageArray,
      status: "ENQUIRY_RECEIVED",
      paymentStatus: "PENDING",
      paymentMethod: "NONE",
    });

    await enquiry.save();

    console.log('✅ Enquiry created successfully:', enquiry._id);

    res.status(201).json({
      message: "Service enquiry submitted successfully",
      enquiry,
    });
  } catch (error) {
    console.error("❌ Error creating enquiry:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.userId,
      userRole: req.user?.role
    });
    res.status(500).json({
      message: error.message || "Failed to submit enquiry",
    });
  }
};

// Customer: Get own enquiries
export const getMyEnquiries = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { customerId: req.user.userId };

    if (status) {
      query.status = status;
    }

    const enquiries = await ServiceEnquiry.find(query)
      .populate("assignedScheduleId", "date startTime endTime")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    res.status(500).json({ message: "Failed to fetch enquiries" });
  }
};

// Customer: Get a specific enquiry
export const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await ServiceEnquiry.findOne({
      _id: id,
      customerId: req.user.userId,
    }).populate("assignedScheduleId", "date startTime endTime");

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.status(200).json({ enquiry });
  } catch (error) {
    console.error("Error fetching enquiry:", error);
    res.status(500).json({ message: "Failed to fetch enquiry" });
  }
};

// Customer: Cancel own enquiry
export const cancelEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await ServiceEnquiry.findOne({
      _id: id,
      customerId: req.user.userId,
    });

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Only allow cancellation if not completed
    if (enquiry.status === "COMPLETED") {
      return res.status(400).json({
        message: "Cannot cancel a completed enquiry",
      });
    }

    enquiry.status = "CANCELLED";
    await enquiry.save();

    res.status(200).json({
      message: "Enquiry cancelled successfully",
      enquiry,
    });
  } catch (error) {
    console.error("Error cancelling enquiry:", error);
    res.status(500).json({ message: "Failed to cancel enquiry" });
  }
};

// Admin: Get all enquiries
export const adminGetAllEnquiries = async (req, res) => {
  try {
    const { status, workType, startDate, endDate } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (workType) {
      query.workType = workType;
    }

    if (startDate && endDate) {
      query.requestedDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const enquiries = await ServiceEnquiry.find(query)
      .populate("customerId", "name email phone")
      .populate("assignedScheduleId", "date startTime endTime status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    res.status(500).json({ message: "Failed to fetch enquiries" });
  }
};

// Admin: Get a specific enquiry
export const adminGetEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await ServiceEnquiry.findById(id)
      .populate("customerId", "name email phone")
      .populate("assignedScheduleId", "date startTime endTime status");

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.status(200).json({ enquiry });
  } catch (error) {
    console.error("Error fetching enquiry:", error);
    res.status(500).json({ message: "Failed to fetch enquiry" });
  }
};

// Admin: Update enquiry status and details
export const adminUpdateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      adminNotes,
      scheduledDate,
      scheduledTime,
      assignedScheduleId,
      estimatedCost,
      actualCost,
    } = req.body;

    const enquiry = await ServiceEnquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Update fields
    if (status !== undefined) {
      enquiry.status = status;
      
      // Set completedAt when marking as completed
      if (status === "COMPLETED" && !enquiry.completedAt) {
        enquiry.completedAt = new Date();
      }
    }

    if (adminNotes !== undefined) enquiry.adminNotes = adminNotes;
    if (scheduledDate !== undefined) enquiry.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    if (scheduledTime !== undefined) enquiry.scheduledTime = scheduledTime;
    if (assignedScheduleId !== undefined) enquiry.assignedScheduleId = assignedScheduleId || null;
    if (estimatedCost !== undefined) enquiry.estimatedCost = estimatedCost;
    if (actualCost !== undefined) enquiry.actualCost = actualCost;

    await enquiry.save();

    // Populate for response
    await enquiry.populate("customerId", "name email phone");
    await enquiry.populate("assignedScheduleId", "date startTime endTime status");

    res.status(200).json({
      message: "Enquiry updated successfully",
      enquiry,
    });
  } catch (error) {
    console.error("Error updating enquiry:", error);
    res.status(500).json({
      message: error.message || "Failed to update enquiry",
    });
  }
};

// Admin: Delete enquiry
export const adminDeleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await ServiceEnquiry.findByIdAndDelete(id);

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.status(200).json({
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    res.status(500).json({ message: "Failed to delete enquiry" });
  }
};

// Admin: Get enquiry statistics
export const adminGetEnquiryStats = async (req, res) => {
  try {
    const stats = await ServiceEnquiry.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const workTypeStats = await ServiceEnquiry.aggregate([
      {
        $group: {
          _id: "$workType",
          count: { $sum: 1 },
          totalCubicFeet: { $sum: "$cubicFeet" },
          totalLogs: { $sum: "$numberOfLogs" },
        },
      },
    ]);

    res.status(200).json({
      statusStats: stats,
      workTypeStats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
};

// ===========================
// Payment APIs (Timber Service)
// ===========================

// Customer: Create Razorpay order for a service enquiry
export const createServicePaymentOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await ServiceEnquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Ensure the enquiry belongs to the current user
    if (enquiry.customerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "You are not allowed to pay for this enquiry" });
    }

    if (!enquiry.estimatedCost || enquiry.estimatedCost <= 0) {
      return res.status(400).json({ message: "Estimated cost not available for this enquiry" });
    }

    const razorpay = getRazorpayInstanceForServices();

    const amountInPaise = Math.round(enquiry.estimatedCost * 100);
    const shortEnquiryId = enquiry._id.toString().slice(-8);
    const timestamp = Date.now().toString().slice(-10);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `svc_${shortEnquiryId}_${timestamp}`,
      notes: {
        enquiryId: enquiry._id.toString(),
        customerName: enquiry.customerName,
        customerPhone: enquiry.phoneNumber || "",
        workType: enquiry.workType,
      },
    };

    const order = await razorpay.orders.create(options);

    // Store order id on enquiry
    enquiry.razorpayOrderId = order.id;
    enquiry.paymentMethod = "ONLINE";
    enquiry.paymentStatus = "PENDING";
    await enquiry.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      customer: {
        name: enquiry.customerName,
        phone: enquiry.phoneNumber || "",
        email: enquiry.customerEmail || "",
      },
    });
  } catch (error) {
    console.error("Error creating service payment order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// Customer: Verify Razorpay payment for a service enquiry
export const verifyServicePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const enquiry = await ServiceEnquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    if (enquiry.customerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "You are not allowed to pay for this enquiry" });
    }

    if (!enquiry.razorpayOrderId || enquiry.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Order mismatch. Please try again." });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Mark payment as successful
    enquiry.paymentStatus = "PAID";
    enquiry.paymentMethod = "ONLINE";
    enquiry.razorpayPaymentId = razorpay_payment_id;
    enquiry.razorpaySignature = razorpay_signature;
    enquiry.paymentDate = new Date();
    // For now, actualCost = estimatedCost; can be adjusted later by admin
    if (!enquiry.actualCost && enquiry.estimatedCost) {
      enquiry.actualCost = enquiry.estimatedCost;
    }
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentStatus: enquiry.paymentStatus,
    });
  } catch (error) {
    console.error("Error verifying service payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Admin: mark offline payment as received
export const adminMarkOfflinePaymentReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const enquiry = await ServiceEnquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    enquiry.paymentMethod = "OFFLINE";
    enquiry.paymentStatus = "PAID";
    enquiry.offlinePaymentNote = note || enquiry.offlinePaymentNote;
    enquiry.paymentDate = new Date();
    if (!enquiry.actualCost && enquiry.estimatedCost) {
      enquiry.actualCost = enquiry.estimatedCost;
    }

    await enquiry.save();

    res.status(200).json({
      success: true,
      message: "Offline payment marked as received",
      enquiry,
    });
  } catch (error) {
    console.error("Error marking offline payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark offline payment",
      error: error.message,
    });
  }
};

// Helper function to validate time within working hours
const validateWorkingHours = (startTime, endTime) => {
  const workStart = "09:00";
  const workEnd = "17:00";

  if (startTime < workStart || startTime >= workEnd) {
    return { valid: false, message: "Start time must be between 09:00 AM and 05:00 PM" };
  }

  if (endTime <= workStart || endTime > workEnd) {
    return { valid: false, message: "End time must be between 09:00 AM and 05:00 PM" };
  }

  if (endTime <= startTime) {
    return { valid: false, message: "End time must be after start time" };
  }

  return { valid: true };
};

// Helper function to calculate end time based on duration
const calculateEndTime = (startTime, durationMinutes) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
};

// Admin: Accept requested time
export const adminAcceptRequestedTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration, adminNotes } = req.body; // duration in minutes

    if (!duration || duration < 15) {
      return res.status(400).json({ 
        message: "Duration is required (minimum 15 minutes)" 
      });
    }

    const enquiry = await ServiceEnquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Use the requested date and time from the enquiry
    const acceptedDate = enquiry.requestedDate;
    const acceptedStartTime = enquiry.requestedTime;
    const acceptedEndTime = calculateEndTime(acceptedStartTime, parseInt(duration));

    // Validate working hours
    const validation = validateWorkingHours(acceptedStartTime, acceptedEndTime);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    // Update enquiry with accepted time and set status to SCHEDULED (Confirmed)
    enquiry.status = "SCHEDULED";
    enquiry.acceptedDate = acceptedDate;
    enquiry.acceptedStartTime = acceptedStartTime;
    enquiry.acceptedEndTime = acceptedEndTime;
    enquiry.scheduledDate = acceptedDate;
    enquiry.scheduledTime = acceptedStartTime;
    if (adminNotes) {
      enquiry.adminNotes = adminNotes;
    }

    await enquiry.save();
    await enquiry.populate("customerId", "name email phone");
    
    // TODO: Send email notification to customer about confirmed booking

    res.status(200).json({
      message: "Requested time accepted successfully",
      enquiry,
    });
  } catch (error) {
    console.error("Error accepting time:", error);
    res.status(500).json({ 
      message: error.message || "Failed to accept time" 
    });
  }
};

// Admin: Propose alternate time
export const adminProposeAlternateTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { proposedDate, proposedStartTime, duration, adminNotes } = req.body; // duration in minutes

    if (!proposedDate || !proposedStartTime || !duration) {
      return res.status(400).json({ 
        message: "Proposed date, start time, and duration are required" 
      });
    }

    if (duration < 15) {
      return res.status(400).json({ 
        message: "Duration must be at least 15 minutes" 
      });
    }

    const enquiry = await ServiceEnquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Calculate end time
    const proposedEndTime = calculateEndTime(proposedStartTime, parseInt(duration));

    // Validate working hours
    const validation = validateWorkingHours(proposedStartTime, proposedEndTime);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    // Update enquiry with proposed time
    enquiry.status = "ALTERNATE_TIME_PROPOSED";
    enquiry.proposedDate = new Date(proposedDate);
    enquiry.proposedStartTime = proposedStartTime;
    enquiry.proposedEndTime = proposedEndTime;
    if (adminNotes) {
      enquiry.adminNotes = adminNotes;
    }

    await enquiry.save();
    await enquiry.populate("customerId", "name email phone");

    res.status(200).json({
      message: "Alternate time proposed successfully",
      enquiry,
    });
  } catch (error) {
    console.error("Error proposing alternate time:", error);
    res.status(500).json({ 
      message: error.message || "Failed to propose alternate time" 
    });
  }
};
