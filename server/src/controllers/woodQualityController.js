import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import WoodQualitySample from "../models/WoodQualitySample.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../../");
const mlDir = path.join(repoRoot, "ml", "wood_quality");
const datasetCsv = path.join(mlDir, "dataset.csv");
const trainerScript = path.join(mlDir, "train_evaluate.py");

function resolvePythonExecutable() {
  if (process.env.PYTHON_EXECUTABLE) return process.env.PYTHON_EXECUTABLE;
  const winPath = path.join(repoRoot, '.venv', 'Scripts', 'python.exe');
  const nixPath = path.join(repoRoot, '.venv', 'bin', 'python');
  if (process.platform === 'win32' && fs.existsSync(winPath)) return winPath;
  if (fs.existsSync(nixPath)) return nixPath;
  return 'python';
}

export const addSample = async (req, res) => {
  try {
    const sample = await WoodQualitySample.create({
      vendorName: req.body.vendorName,
      woodType: req.body.woodType,
      lengthCm: Number(req.body.lengthCm),
      widthCm: Number(req.body.widthCm),
      thicknessCm: Number(req.body.thicknessCm),
      moisturePct: Number(req.body.moisturePct),
      costPerUnit: Number(req.body.costPerUnit),
      quality: req.body.quality
    });
    res.status(201).json({ ok: true, sample });
  } catch (e) {
    res.status(400).json({ ok: false, message: e.message });
  }
};

export const listSamples = async (_req, res) => {
  const samples = await WoodQualitySample.find().sort({ createdAt: -1 }).limit(500);
  res.json({ ok: true, samples });
};

function exportToCsv(samples) {
  const header = ['Vendor','WoodType','Length_cm','Width_cm','Thickness_cm','Moisture','Cost_per_unit','Quality'];
  const lines = [header.join(',')];
  for (const s of samples) {
    const row = [
      s.vendorName,
      s.woodType,
      s.lengthCm,
      s.widthCm,
      s.thicknessCm,
      s.moisturePct,
      s.costPerUnit,
      s.quality
    ];
    lines.push(row.join(','));
  }
  fs.mkdirSync(mlDir, { recursive: true });
  fs.writeFileSync(datasetCsv, lines.join('\n'), 'utf-8');
}

export const trainFromMongo = async (_req, res) => {
  try {
    const samples = await WoodQualitySample.find();
    if (!samples.length) {
      return res.status(400).json({ ok: false, message: 'No samples to train' });
    }
    exportToCsv(samples);

    const pyExec = resolvePythonExecutable();
    const py = spawn(pyExec, [trainerScript, '--data', datasetCsv, '--out', path.join(mlDir, 'results')], { cwd: repoRoot });
    let stdout = '';
    let stderr = '';
    py.stdout.on('data', d => { stdout += d.toString(); });
    py.stderr.on('data', d => { stderr += d.toString(); });
    py.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ ok: false, message: 'Trainer failed', stderr });
      }
      return res.json({ ok: true, message: 'Training complete', stdout });
    });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};
