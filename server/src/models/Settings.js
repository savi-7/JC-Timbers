import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  revenueResetAt: { type: Date, default: null }
}, { timestamps: true });

// Single document for app settings (use findOne and upsert)
const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
