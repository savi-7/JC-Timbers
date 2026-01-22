import ServiceSchedule from "../models/ServiceSchedule.js";
import ServiceEnquiry from "../models/ServiceEnquiry.js";

// Helper function to check for overlapping time slots
const checkOverlap = async (date, startTime, endTime, excludeId = null) => {
  const query = {
    date: new Date(date).setHours(0, 0, 0, 0),
    status: { $ne: "cancelled" },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingSlots = await ServiceSchedule.find(query);

  for (const slot of existingSlots) {
    // Check if the new time range overlaps with existing slot
    if (
      (startTime >= slot.startTime && startTime < slot.endTime) ||
      (endTime > slot.startTime && endTime <= slot.endTime) ||
      (startTime <= slot.startTime && endTime >= slot.endTime)
    ) {
      return {
        overlap: true,
        conflictingSlot: slot,
      };
    }
  }

  return { overlap: false };
};

// Create a new schedule block
export const createScheduleBlock = async (req, res) => {
  try {
    const { date, startTime, duration, title, notes, customerName, customerPhone, serviceType } = req.body;

    if (!date || !startTime || !duration) {
      return res.status(400).json({ message: "Date, start time, and duration are required" });
    }

    // Calculate end time based on duration
    const [startHour, startMin] = startTime.split(":").map(Number);
    const totalMinutes = startHour * 60 + startMin + parseInt(duration);
    const endHour = Math.floor(totalMinutes / 60);
    const endMin = totalMinutes % 60;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

    // Validate working hours
    if (endHour > 17 || (endHour === 17 && endMin > 0)) {
      return res.status(400).json({ 
        message: "Booking cannot extend beyond 17:00 (5:00 PM)" 
      });
    }

    // Check for overlapping slots
    const overlapCheck = await checkOverlap(date, startTime, endTime);
    if (overlapCheck.overlap) {
      return res.status(409).json({
        message: "Time slot overlaps with an existing booking",
        conflictingSlot: {
          date: overlapCheck.conflictingSlot.date,
          startTime: overlapCheck.conflictingSlot.startTime,
          endTime: overlapCheck.conflictingSlot.endTime,
          title: overlapCheck.conflictingSlot.title,
        },
      });
    }

    const scheduleBlock = new ServiceSchedule({
      date: new Date(date).setHours(0, 0, 0, 0),
      startTime,
      endTime,
      duration: parseInt(duration),
      title: title || "Blocked Time",
      notes: notes || "",
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      serviceType: serviceType || "",
      status: "blocked",
    });

    await scheduleBlock.save();

    res.status(201).json({
      message: "Schedule block created successfully",
      schedule: scheduleBlock,
    });
  } catch (error) {
    console.error("Error creating schedule block:", error);
    res.status(500).json({ 
      message: error.message || "Failed to create schedule block" 
    });
  }
};

// Get all schedule blocks
export const getAllScheduleBlocks = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).setHours(0, 0, 0, 0),
        $lte: new Date(endDate).setHours(23, 59, 59, 999),
      };
    }

    if (status) {
      query.status = status;
    }

    const schedules = await ServiceSchedule.find(query).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("Error fetching schedule blocks:", error);
    res.status(500).json({ message: "Failed to fetch schedule blocks" });
  }
};

// Get schedule blocks for a specific date
export const getScheduleByDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const schedules = await ServiceSchedule.find({
      date: new Date(date).setHours(0, 0, 0, 0),
    }).sort({ startTime: 1 });

    res.status(200).json({
      date,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("Error fetching schedule for date:", error);
    res.status(500).json({ message: "Failed to fetch schedule" });
  }
};

// Update a schedule block
export const updateScheduleBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, duration, title, notes, status, customerName, customerPhone, serviceType } = req.body;

    const scheduleBlock = await ServiceSchedule.findById(id);

    if (!scheduleBlock) {
      return res.status(404).json({ message: "Schedule block not found" });
    }

    // If time is being changed, validate and check overlap
    if (date || startTime || duration) {
      const newDate = date ? new Date(date).setHours(0, 0, 0, 0) : scheduleBlock.date;
      const newStartTime = startTime || scheduleBlock.startTime;
      const newDuration = duration ? parseInt(duration) : scheduleBlock.duration;

      // Calculate new end time
      const [startHour, startMin] = newStartTime.split(":").map(Number);
      const totalMinutes = startHour * 60 + startMin + newDuration;
      const endHour = Math.floor(totalMinutes / 60);
      const endMin = totalMinutes % 60;
      const newEndTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

      // Validate working hours
      if (endHour > 17 || (endHour === 17 && endMin > 0)) {
        return res.status(400).json({ 
          message: "Booking cannot extend beyond 17:00 (5:00 PM)" 
        });
      }

      // Check for overlapping slots (excluding current block)
      const overlapCheck = await checkOverlap(newDate, newStartTime, newEndTime, id);
      if (overlapCheck.overlap) {
        return res.status(409).json({
          message: "Updated time slot overlaps with an existing booking",
          conflictingSlot: {
            date: overlapCheck.conflictingSlot.date,
            startTime: overlapCheck.conflictingSlot.startTime,
            endTime: overlapCheck.conflictingSlot.endTime,
            title: overlapCheck.conflictingSlot.title,
          },
        });
      }

      scheduleBlock.date = newDate;
      scheduleBlock.startTime = newStartTime;
      scheduleBlock.endTime = newEndTime;
      scheduleBlock.duration = newDuration;
    }

    if (title !== undefined) scheduleBlock.title = title;
    if (notes !== undefined) scheduleBlock.notes = notes;
    if (status !== undefined) scheduleBlock.status = status;
    if (customerName !== undefined) scheduleBlock.customerName = customerName;
    if (customerPhone !== undefined) scheduleBlock.customerPhone = customerPhone;
    if (serviceType !== undefined) scheduleBlock.serviceType = serviceType;

    await scheduleBlock.save();

    res.status(200).json({
      message: "Schedule block updated successfully",
      schedule: scheduleBlock,
    });
  } catch (error) {
    console.error("Error updating schedule block:", error);
    res.status(500).json({ 
      message: error.message || "Failed to update schedule block" 
    });
  }
};

// Delete a schedule block
export const deleteScheduleBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const scheduleBlock = await ServiceSchedule.findByIdAndDelete(id);

    if (!scheduleBlock) {
      return res.status(404).json({ message: "Schedule block not found" });
    }

    res.status(200).json({
      message: "Schedule block deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting schedule block:", error);
    res.status(500).json({ message: "Failed to delete schedule block" });
  }
};

// Get available time slots for a specific date
// This is a PUBLIC endpoint - no authentication required
export const getAvailableSlots = async (req, res) => {
  try {
    console.log('📅 Availability check requested:', {
      date: req.params.date,
      duration: req.query.duration,
      path: req.path,
      method: req.method
    });
    
    const { date } = req.params;
    const { duration } = req.query; // Expected duration in minutes

    if (!date || !duration) {
      return res.status(400).json({ message: "Date and duration are required" });
    }

    const requestedDuration = parseInt(duration);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const targetDateTimestamp = targetDate.getTime();
    const targetDateEnd = new Date(date);
    targetDateEnd.setHours(23, 59, 59, 999);

    // Get all booked slots from ServiceSchedule
    const bookedScheduleSlots = await ServiceSchedule.find({
      date: targetDateTimestamp,
      status: { $ne: "cancelled" },
    }).sort({ startTime: 1 });

    // Get all scheduled enquiries from ServiceEnquiry
    const scheduledEnquiries = await ServiceEnquiry.find({
      $or: [
        // Enquiries with scheduled date/time
        {
          scheduledDate: {
            $gte: targetDate,
            $lt: targetDateEnd
          },
          status: { $in: ["SCHEDULED", "TIME_ACCEPTED", "IN_PROGRESS"] }
        },
        // Enquiries with accepted date/time
        {
          acceptedDate: {
            $gte: targetDate,
            $lt: targetDateEnd
          },
          status: { $in: ["TIME_ACCEPTED", "SCHEDULED", "IN_PROGRESS"] }
        }
      ]
    }).sort({ scheduledTime: 1, acceptedStartTime: 1 });

    // Combine all booked slots
    const bookedSlots = [];
    
    // Add schedule blocks
    bookedScheduleSlots.forEach(slot => {
      bookedSlots.push({
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: 'schedule',
        title: slot.title || 'Blocked Time'
      });
    });

    // Add scheduled enquiries
    scheduledEnquiries.forEach(enquiry => {
      if (enquiry.scheduledDate && enquiry.scheduledTime) {
        const startTime = enquiry.scheduledTime;
        // Calculate end time based on work type or default 2 hours
        const [startHour, startMin] = startTime.split(':').map(Number);
        const duration = 120; // Default 2 hours, can be adjusted based on work type
        const totalMinutes = startHour * 60 + startMin + duration;
        const endHour = Math.floor(totalMinutes / 60);
        const endMin = totalMinutes % 60;
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
        
        bookedSlots.push({
          startTime: startTime,
          endTime: endTime,
          type: 'enquiry',
          title: `Service: ${enquiry.workType} - ${enquiry.customerName}`
        });
      } else if (enquiry.acceptedDate && enquiry.acceptedStartTime) {
        bookedSlots.push({
          startTime: enquiry.acceptedStartTime,
          endTime: enquiry.acceptedEndTime || enquiry.acceptedStartTime,
          type: 'enquiry',
          title: `Service: ${enquiry.workType} - ${enquiry.customerName}`
        });
      }
    });

    // Sort all booked slots by start time
    bookedSlots.sort((a, b) => {
      const [aHour, aMin] = a.startTime.split(':').map(Number);
      const [bHour, bMin] = b.startTime.split(':').map(Number);
      return (aHour * 60 + aMin) - (bHour * 60 + bMin);
    });

    // Working hours
    const workStart = "09:00";
    const workEnd = "17:00";

    // Generate available slots
    const availableSlots = [];
    let currentTime = workStart;

    for (const slot of bookedSlots) {
      // If there's a gap before this booking
      if (currentTime < slot.startTime) {
        availableSlots.push({
          startTime: currentTime,
          endTime: slot.startTime,
        });
      }
      currentTime = slot.endTime;
    }

    // Add remaining time after last booking
    if (currentTime < workEnd) {
      availableSlots.push({
        startTime: currentTime,
        endTime: workEnd,
      });
    }

    // Filter slots that can accommodate the requested duration
    const suitableSlots = availableSlots.filter((slot) => {
      const [startHour, startMin] = slot.startTime.split(":").map(Number);
      const [endHour, endMin] = slot.endTime.split(":").map(Number);
      const slotDuration = (endHour - startHour) * 60 + (endMin - startMin);
      return slotDuration >= requestedDuration;
    });

    console.log('✅ Availability check result:', {
      date,
      requestedDuration,
      availableCount: suitableSlots.length,
      bookedCount: bookedSlots.length
    });

    res.status(200).json({
      date,
      requestedDuration,
      availableSlots: suitableSlots,
      bookedSlots: bookedSlots.map((s) => ({
        startTime: s.startTime,
        endTime: s.endTime,
        title: s.title,
        type: s.type,
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching available slots:", error);
    res.status(500).json({ message: "Failed to fetch available slots" });
  }
};
