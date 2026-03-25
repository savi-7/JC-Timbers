import Machine from "../models/Machine.js";
import MachineReading from "../models/MachineReading.js";

const DEFAULT_TEMP = Number(process.env.MACHINERY_DEFAULT_TEMP_THRESHOLD) || 40;
const DEFAULT_VIBRATION = Number(process.env.MACHINERY_DEFAULT_VIBRATION_THRESHOLD) || 1500;

// function validateWebhookAuth(req) {
//   const secret = process.env.IOT_WEBHOOK_SECRET;
//   if (!secret) return true;
//   const apiKey = req.headers["x-api-key"] || (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "").trim();
//   return apiKey === secret;
// }

export const webhook = async (req, res) => {
  // if (!validateWebhookAuth(req)) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  try {
    const body = req.body || {};
    const readings = Array.isArray(body.readings)
      ? body.readings
      : body.machineId != null
        ? [{ machineId: body.machineId, temperature: body.temperature, vibration: body.vibration }]
        : [];
    if (!readings.length) {
      return res.status(400).json({ message: "Missing machineId/temperature/vibration or readings array" });
    }

    const updatedMachines = [];

    for (const r of readings) {
      const machineId = r.machineId;
      if (!machineId) continue;
      const temperature = typeof r.temperature === "number" ? r.temperature : Number(r.temperature);
      const vibration = typeof r.vibration === "number" ? r.vibration : Number(r.vibration);
      const setFields = { lastReadingAt: new Date() };
      if (Number.isFinite(temperature)) setFields.lastTemperature = temperature;
      if (Number.isFinite(vibration)) setFields.lastVibration = vibration;

      const doc = await Machine.findOneAndUpdate(
        { machineId: String(machineId).trim() },
        {
          $set: setFields,
          $setOnInsert: {
            name: String(machineId).trim(),
            tempThreshold: DEFAULT_TEMP,
            vibrationThreshold: DEFAULT_VIBRATION
          }
        },
        { upsert: true, new: true }
      );

      if (doc) {
        if (Number.isFinite(temperature) || Number.isFinite(vibration)) {
          await MachineReading.create({
            machineId: doc.machineId,
            temperature: Number.isFinite(temperature) ? temperature : undefined,
            vibration: Number.isFinite(vibration) ? vibration : undefined,
            timestamp: setFields.lastReadingAt
          });
        }
        updatedMachines.push({
          machineId: doc.machineId,
          name: doc.name,
          tempThreshold: doc.tempThreshold,
          vibrationThreshold: doc.vibrationThreshold,
          lastTemperature: doc.lastTemperature,
          lastVibration: doc.lastVibration,
          lastReadingAt: doc.lastReadingAt
        });
      }
    }

    return res.status(200).json({ ok: true, machines: updatedMachines });
  } catch (err) {
    console.error("Machinery webhook error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

export const listMachines = async (_req, res) => {
  try {
    const machines = await Machine.find().sort({ machineId: 1 }).lean();
    res.json({ machines });
  } catch (err) {
    console.error("List machines error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
};

export const getMachineThreshold = async (req, res) => {
  try {
    const { machineId } = req.params;
    if (!machineId) {
      return res.status(400).json({ message: "machineId is required" });
    }

    const doc = await Machine.findOneAndUpdate(
      { machineId: String(machineId).trim() },
      {
        $setOnInsert: {
          name: String(machineId).trim(),
          tempThreshold: DEFAULT_TEMP,
          vibrationThreshold: DEFAULT_VIBRATION
        }
      },
      { upsert: true, new: true }
    );

    if (!doc) {
      return res.status(500).json({ message: "Failed to create or load machine" });
    }

    return res.json({
      machineId: doc.machineId,
      name: doc.name,
      tempThreshold: doc.tempThreshold,
      vibrationThreshold: doc.vibrationThreshold,
      lastTemperature: doc.lastTemperature,
      lastVibration: doc.lastVibration,
      lastReadingAt: doc.lastReadingAt
    });
  } catch (err) {
    console.error("Get machine threshold error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

export const updateMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tempThreshold, vibrationThreshold } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (typeof tempThreshold === "number") update.tempThreshold = tempThreshold;
    if (typeof vibrationThreshold === "number") update.vibrationThreshold = vibrationThreshold;
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }
    const machine = await Machine.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!machine) return res.status(404).json({ message: "Machine not found" });
    res.json({ machine });
  } catch (err) {
    console.error("Update machine error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
};

export const getMachineReadings = async (req, res) => {
  try {
    const { machineId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 100;
    if (!machineId) {
      return res.status(400).json({ message: "machineId is required" });
    }
    const readings = await MachineReading.find({ machineId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    return res.json({ ok: true, readings });
  } catch (err) {
    console.error("Get machine readings error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};
