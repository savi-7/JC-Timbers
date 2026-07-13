import mongoose from "mongoose";

const woodQualitySampleSchema = new mongoose.Schema({
  vendorName: { type: String, required: true, trim: true },
  woodType: { type: String, required: true, enum: ['Teak','Mahogany','Pine','Rosewood','Oak','Cedar','Bamboo','Plywood','Other'] },
  lengthCm: { type: Number, required: true, min: 0 },
  widthCm: { type: Number, required: true, min: 0 },
  thicknessCm: { type: Number, required: true, min: 0 },
  moisturePct: { type: Number, required: true, min: 0, max: 100 },
  costPerUnit: { type: Number, required: true, min: 0 }, // ₹/cubic foot
  quality: { type: String, required: true, enum: ['High','Medium','Low'] },
  createdAt: { type: Date, default: Date.now }
});

const WoodQualitySample = mongoose.model('WoodQualitySample', woodQualitySampleSchema);

export default WoodQualitySample;
