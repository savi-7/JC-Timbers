import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import WoodQualitySample from '../src/models/WoodQualitySample.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../');
const mlDir = path.join(repoRoot, 'ml', 'wood_quality');
const datasetCsv = path.join(mlDir, 'dataset.csv');
const trainerScript = path.join(mlDir, 'train_evaluate.py');

dotenv.config({ path: path.join(repoRoot, 'server', '.env') });

function randRange(min, max) {
	return Math.random() * (max - min) + min;
}

function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateSample(idx) {
	const woodTypes = ['Teak','Mahogany','Pine','Rosewood','Oak','Cedar'];
	const woodType = pick(woodTypes);
	const vendorName = `V${String(idx + 1).padStart(3, '0')}`;

	// Base stats by type
	const base = {
		Teak:      { len:[200,250], wid:[25,35], thk:[30,50], moist:[6,12], cost:[800,1100] },
		Mahogany:  { len:[180,230], wid:[24,32], thk:[25,45], moist:[10,20], cost:[650,900] },
		Pine:      { len:[180,230], wid:[20,28], thk:[20,35], moist:[12,22], cost:[400,650] },
		Rosewood:  { len:[190,240], wid:[25,33], thk:[28,48], moist:[6,14], cost:[900,1200] },
		Oak:       { len:[190,240], wid:[24,32], thk:[25,45], moist:[8,16], cost:[700,1000] },
		Cedar:     { len:[180,230], wid:[22,30], thk:[22,40], moist:[10,18], cost:[550,800] }
	}[woodType];

	const lengthCm = randRange(base.len[0], base.len[1]);
	const widthCm = randRange(base.wid[0], base.wid[1]);
	const thicknessCm = randRange(base.thk[0], base.thk[1]);
	const moisturePct = randRange(base.moist[0], base.moist[1]);
	const costPerUnit = randRange(base.cost[0], base.cost[1]);

	// Heuristic quality label
	let score = 0;
	score += (costPerUnit - base.cost[0]) / (base.cost[1]-base.cost[0]+1e-9) * 0.4;
	score += ( (base.moist[1] - moisturePct) / (base.moist[1]-base.moist[0]+1e-9) ) * 0.3;
	score += ( (lengthCm - base.len[0]) / (base.len[1]-base.len[0]+1e-9) ) * 0.15;
	score += ( (widthCm - base.wid[0]) / (base.wid[1]-base.wid[0]+1e-9) ) * 0.075;
	score += ( (thicknessCm - base.thk[0]) / (base.thk[1]-base.thk[0]+1e-9) ) * 0.075;

	let quality = 'Medium';
	if (score >= 0.66) quality = 'High';
	else if (score <= 0.33) quality = 'Low';

	return {
		vendorName,
		woodType,
		lengthCm: Number(lengthCm.toFixed(1)),
		widthCm: Number(widthCm.toFixed(1)),
		thicknessCm: Number(thicknessCm.toFixed(1)),
		moisturePct: Number(moisturePct.toFixed(1)),
		costPerUnit: Math.round(costPerUnit),
		quality
	};
}

async function seed(count) {
	await connectDB();
	const docs = Array.from({ length: count }, (_, i) => generateSample(i));
	await WoodQualitySample.insertMany(docs);
	console.log(`Inserted ${docs.length} wood quality samples.`);
	return docs;
}

function exportToCsv(samples) {
	const header = ['Vendor','WoodType','Length_cm','Width_cm','Thickness_cm','Moisture','Cost_per_unit','Quality'];
	const lines = [header.join(',')];
	samples.forEach(s => {
		lines.push([s.vendorName, s.woodType, s.lengthCm, s.widthCm, s.thicknessCm, s.moisturePct, s.costPerUnit, s.quality].join(','));
	});
	fs.mkdirSync(mlDir, { recursive: true });
	fs.writeFileSync(datasetCsv, lines.join('\n'), 'utf-8');
	console.log(`Exported CSV to ${datasetCsv}`);
}

async function train() {
	return new Promise((resolve, reject) => {
		const py = spawn(process.env.PYTHON_EXECUTABLE || 'python', [trainerScript, '--data', datasetCsv, '--out', path.join(mlDir, 'results')], { cwd: repoRoot });
		let stdout = '';
		let stderr = '';
		py.stdout.on('data', d => { stdout += d.toString(); process.stdout.write(d.toString()); });
		py.stderr.on('data', d => { stderr += d.toString(); process.stderr.write(d.toString()); });
		py.on('close', code => {
			if (code !== 0) return reject(new Error(`Trainer exited ${code}: ${stderr}`));
			resolve(stdout);
		});
	});
}

(async () => {
	try {
		const countArg = process.argv.find(a => a.startsWith('--count='));
		const count = countArg ? Number(countArg.split('=')[1]) : 150;
		const samples = await seed(count);
		exportToCsv(samples);
		await train();
		console.log('Seeding and training complete.');
		process.exit(0);
	} catch (e) {
		console.error('Failed:', e);
		process.exit(1);
	}
})();
