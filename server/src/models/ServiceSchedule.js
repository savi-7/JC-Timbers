import mongoose from "mongoose";

const serviceScheduleSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String, // Format: "HH:MM" (e.g., "09:00")
      required: true,
      validate: {
        validator: function (v) {
          return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "Start time must be in HH:MM format",
      },
    },
    endTime: {
      type: String, // Format: "HH:MM" (e.g., "17:00")
      required: true,
      validate: {
        validator: function (v) {
          return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "End time must be in HH:MM format",
      },
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
      min: 15,
    },
    title: {
      type: String,
      trim: true,
      default: "Blocked Time",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["blocked", "booked", "completed", "cancelled"],
      default: "blocked",
      index: true,
    },
    customerName: {
      type: String,
      trim: true,
      default: "",
    },
    customerPhone: {
      type: String,
      trim: true,
      default: "",
    },
    serviceType: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index for efficient date-based queries
serviceScheduleSchema.index({ date: 1, startTime: 1 });

// Validate working hours (09:00 - 17:00)
serviceScheduleSchema.pre("save", function (next) {
  const workStart = "09:00";
  const workEnd = "17:00";

  if (this.startTime < workStart || this.startTime >= workEnd) {
    return next(
      new Error(
        `Start time must be between ${workStart} and ${workEnd}`
      )
    );
  }

  if (this.endTime <= workStart || this.endTime > workEnd) {
    return next(
      new Error(`End time must be between ${workStart} and ${workEnd}`)
    );
  }

  if (this.endTime <= this.startTime) {
    return next(new Error("End time must be after start time"));
  }

  // Calculate duration based on start and end time
  const [startHour, startMin] = this.startTime.split(":").map(Number);
  const [endHour, endMin] = this.endTime.split(":").map(Number);
  const calculatedDuration = (endHour - startHour) * 60 + (endMin - startMin);
  
  if (calculatedDuration !== this.duration) {
    this.duration = calculatedDuration;
  }

  next();
});

const ServiceSchedule = mongoose.model("ServiceSchedule", serviceScheduleSchema);

export default ServiceSchedule;
