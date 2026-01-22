import ServiceEnquiry from "../models/ServiceEnquiry.js";
import ServiceSchedule from "../models/ServiceSchedule.js";
import User from "../models/User.js";
import path from "path";
import { convertImageToBase64 } from "../middleware/upload.js";

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
      woodType,
      numberOfLogs,
      cubicFeet,
      requestedDate,
      requestedTime,
      phoneNumber,
      name,
      notes,
    } = req.body;

    // Validate required fields
    if (!workType || !numberOfLogs || !cubicFeet || !requestedDate || !requestedTime || !phoneNumber || !name) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Validate work type
    const validWorkTypes = ["Planing", "Resawing", "Debarking", "Sawing", "Other"];
    if (!validWorkTypes.includes(workType)) {
      return res.status(400).json({
        message: "Invalid work type",
      });
    }

    // Check if the requested time slot is already booked
    const requestedDateObj = new Date(requestedDate);
    requestedDateObj.setHours(0, 0, 0, 0);
    
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
    });
    
    const overlappingEnquiry = allScheduledEnquiries.find(enquiry => {
      const conflictStart = enquiry.scheduledTime || enquiry.acceptedStartTime;
      if (!conflictStart) return false;
      
      let conflictEnd;
      if (enquiry.scheduledTime) {
        const [h, m] = conflictStart.split(':').map(Number);
        const total = h * 60 + m + 120;
        conflictEnd = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      } else {
        conflictEnd = enquiry.acceptedEndTime || conflictStart;
      }
      
      // Check if requested time overlaps with enquiry time
      return (requestedTime >= conflictStart && requestedTime < conflictEnd) ||
             (endTime > conflictStart && endTime <= conflictEnd) ||
             (requestedTime <= conflictStart && endTime >= conflictEnd);
    });
    
    if (overlappingEnquiry) {
      const conflictTime = overlappingEnquiry.scheduledTime || overlappingEnquiry.acceptedStartTime;
      let conflictEnd;
      if (overlappingEnquiry.scheduledTime) {
        const [h, m] = conflictTime.split(':').map(Number);
        const total = h * 60 + m + 120;
        conflictEnd = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      } else {
        conflictEnd = overlappingEnquiry.acceptedEndTime || conflictTime;
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

    // Create enquiry
    const enquiry = new ServiceEnquiry({
      customerId: req.user.userId,
      customerName: name || customer.name || "Customer",
      customerEmail: customer.email || "",
      phoneNumber,
      workType,
      woodType: woodType || "",
      numberOfLogs: parseInt(numberOfLogs),
      cubicFeet: parseFloat(cubicFeet),
      requestedDate: new Date(requestedDate),
      requestedTime,
      notes: notes || "",
      images: imageArray,
      status: "ENQUIRY_RECEIVED",
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
