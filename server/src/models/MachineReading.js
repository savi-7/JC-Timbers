import mongoose from "mongoose";

const machineReadingSchema = new mongoose.Schema({
  machineId: { type: String, required: true, index: true },
  temperature: { type: Number },
  vibration: { type: Number },
  timestamp: { type: Date, default: Date.now, index: true }
});

const MachineReading = mongoose.model("MachineReading", machineReadingSchema);

export default MachineReading;
