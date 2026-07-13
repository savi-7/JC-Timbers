import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from 'url';
import Order from "../models/Order.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../../");
const pyScript = path.join(repoRoot, "ml", "customer_segmentation", "segment.py");

function computeCustomerFeatures(orders) {
	const byUser = new Map();
	for (const o of orders) {
		const userId = String(o.user);
		const entry = byUser.get(userId) || { totalOrders: 0, totalAmount: 0, categories: new Set(), returns: 0 };
		entry.totalOrders += 1;
		entry.totalAmount += Number(o.totalAmount || 0);
		// Use product names as category proxy if subcategory not stored on order
		for (const item of (o.items || [])) {
			if (item && item.name) entry.categories.add(item.name);
		}
		// If status indicates cancellation/refund, treat as return
		if (o.status === 'Cancelled' || o.paymentStatus === 'Refunded') entry.returns += 1;
		byUser.set(userId, entry);
	}

	const features = [];
	for (const [userId, v] of byUser.entries()) {
		const avgOrderValue = v.totalOrders > 0 ? v.totalAmount / v.totalOrders : 0;
		const returnRate = v.totalOrders > 0 ? v.returns / v.totalOrders : 0;
		features.push({
			customerId: userId,
			totalOrders: v.totalOrders,
			avgOrderValue,
			categoriesPurchased: v.categories.size,
			returnRate
		});
	}
	return features;
}

export const snapshotSegments = async (req, res) => {
	try {
		// Recent orders (limit to reasonable window)
		const orders = await Order.find({}).select('user items totalAmount status paymentStatus').lean();
		const features = computeCustomerFeatures(orders);
		if (features.length === 0) return res.json({ ok: true, results: [] });

		const py = spawn(process.env.PYTHON_EXECUTABLE || 'python', [pyScript], { cwd: repoRoot });
		let stdout = ""; let stderr = "";
		py.stdout.on('data', d => { stdout += d.toString(); });
		py.stderr.on('data', d => { stderr += d.toString(); process.stderr.write(d.toString()); });
		py.on('error', err => res.status(500).json({ ok: false, message: 'Python spawn error', error: err.message }));
		py.on('close', async code => {
			if (code !== 0) return res.status(500).json({ ok: false, message: 'Python exited with code ' + code, stderr });
			try {
				const parsed = JSON.parse(stdout.trim());
				const results = Array.isArray(parsed.results) ? parsed.results : [];
				const ids = results.map(r => r.customerId).filter(Boolean);
				const users = await User.find({ _id: { $in: ids } }).select('name email role').lean();
				const infoById = new Map(users.map(u => [String(u._id), { name: u.name, email: u.email, role: u.role }]));
				const enriched = results.map(r => ({
					...r,
					user: infoById.get(String(r.customerId)) || null
				}));
				return res.json({ ok: true, results: enriched });
			} catch (e) {
				return res.status(500).json({ ok: false, message: 'Invalid JSON from segmenter', stdout, stderr });
			}
		});
		py.stdin.write(JSON.stringify({ customers: features }));
		py.stdin.end();
	} catch (e) {
		return res.status(500).json({ ok: false, message: 'Segmentation failed', error: e.message });
	}
};


