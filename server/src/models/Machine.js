import mongoose from "mongoose";

const machineSchema = new mongoose.Schema({
  machineId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, trim: true, default: "" },
  tempThreshold: { type: Number, default: 80 },
  vibrationThreshold: { type: Number, default: 10 },
  lastTemperature: { type: Number },
  lastVibration: { type: Number },
  lastReadingAt: { type: Date }
});

const Machine = mongoose.model("Machine", machineSchema);

export default Machine;
