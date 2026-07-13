import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../../");
const pyScript = path.join(repoRoot, "ml", "wood_quality", "predict.py");
const modelsDir = path.join(repoRoot, "ml", "wood_quality", "results");
const datasetCsv = path.join(repoRoot, "ml", "wood_quality", "dataset.csv");

function resolvePythonExecutable() {
	if (process.env.PYTHON_EXECUTABLE) return process.env.PYTHON_EXECUTABLE;
	const winPath = path.join(repoRoot, '.venv', 'Scripts', 'python.exe');
	const nixPath = path.join(repoRoot, '.venv', 'bin', 'python');
	if (process.platform === 'win32' && fs.existsSync(winPath)) return winPath;
	if (fs.existsSync(nixPath)) return nixPath;
	return 'python';
}

export const predictWoodQuality = async (req, res) => {
	try {
		const inputPayload = {
			vendor: req.body.vendor,
			woodType: req.body.woodType,
			length: req.body.length,
			width: req.body.width,
			thickness: req.body.thickness,
			moisture: req.body.moisture,
			costPerUnit: req.body.costPerUnit
		};

		const pyArgs = [pyScript, "--models_dir", modelsDir, "--data", datasetCsv];
		const pyExec = resolvePythonExecutable();
		const py = spawn(pyExec, pyArgs, { cwd: repoRoot });

		let stdout = "";
		let stderr = "";

		py.stdout.on("data", (d) => { stdout += d.toString(); });
		py.stderr.on("data", (d) => { 
			const debugMsg = d.toString();
			stderr += debugMsg;
			// Print debug messages from Python script to console
			process.stderr.write(debugMsg);
		});

		py.on("error", (err) => {
			return res.status(500).json({ ok: false, message: "Python spawn error", error: err.message });
		});

		py.on("close", (code) => {
			if (code !== 0) {
				return res.status(500).json({ ok: false, message: "Python exited with code " + code, stderr });
			}
			try {
				const parsed = JSON.parse(stdout.trim());
				return res.json(parsed);
			} catch (e) {
				return res.status(500).json({ ok: false, message: "Invalid JSON from predictor", stdout, stderr });
			}
		});

		py.stdin.write(JSON.stringify(inputPayload));
		py.stdin.end();
	} catch (error) {
		return res.status(500).json({ ok: false, message: "Prediction failed", error: error.message });
	}
};
