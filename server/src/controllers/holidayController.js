import Holiday from "../models/Holiday.js";

// Get all holidays
export const getAllHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find()
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    res.status(200).json({
      count: holidays.length,
      holidays,
    });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    res.status(500).json({ message: "Failed to fetch holidays" });
  }
};

// Create a new holiday
export const createHoliday = async (req, res) => {
  try {
    const { date, name, description, isRecurring } = req.body;

    if (!date || !name) {
      return res.status(400).json({
        message: "Date and name are required",
      });
    }

    // Check if holiday already exists for this date
    const existingHoliday = await Holiday.findOne({ date: new Date(date) });
    if (existingHoliday) {
      return res.status(400).json({
        message: "A holiday already exists for this date",
      });
    }

    const holiday = new Holiday({
      date: new Date(date),
      name,
      description: description || "",
      isRecurring: isRecurring || false,
      createdBy: req.user.userId,
    });

    await holiday.save();
    await holiday.populate("createdBy", "name email");

    res.status(201).json({
      message: "Holiday created successfully",
      holiday,
    });
  } catch (error) {
    console.error("Error creating holiday:", error);
    res.status(500).json({
      message: error.message || "Failed to create holiday",
    });
  }
};

// Update a holiday
export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, name, description, isRecurring } = req.body;

    const holiday = await Holiday.findById(id);
    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    // Check if date is being changed and if new date already has a holiday
    if (date && new Date(date).getTime() !== holiday.date.getTime()) {
      const existingHoliday = await Holiday.findOne({ date: new Date(date) });
      if (existingHoliday && existingHoliday._id.toString() !== id) {
        return res.status(400).json({
          message: "A holiday already exists for this date",
        });
      }
    }

    if (date) holiday.date = new Date(date);
    if (name) holiday.name = name;
    if (description !== undefined) holiday.description = description;
    if (isRecurring !== undefined) holiday.isRecurring = isRecurring;

    await holiday.save();
    await holiday.populate("createdBy", "name email");

    res.status(200).json({
      message: "Holiday updated successfully",
      holiday,
    });
  } catch (error) {
    console.error("Error updating holiday:", error);
    res.status(500).json({
      message: error.message || "Failed to update holiday",
    });
  }
};

// Delete a holiday
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findByIdAndDelete(id);
    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.status(200).json({
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    res.status(500).json({ message: "Failed to delete holiday" });
  }
};

// Check if a date is a holiday
export const checkHoliday = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const holiday = await Holiday.findOne({ date: new Date(date) });

    res.status(200).json({
      isHoliday: !!holiday,
      holiday: holiday || null,
    });
  } catch (error) {
    console.error("Error checking holiday:", error);
    res.status(500).json({ message: "Failed to check holiday" });
  }
};

export default {
  getAllHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  checkHoliday,
};
