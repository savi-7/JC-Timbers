import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../components/NotificationProvider";

export default function AdminWoodQuality() {
	const { user } = useAuth();
	const { showSuccess, showError } = useNotification();
	const [vendors, setVendors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [form, setForm] = useState({
		vendorId: "",
		woodType: "Teak",
		lengthM: "2.20",
		widthCm: "30",
		thicknessCm: "40",
		moisturePct: "10",
		costPerUnit: "900"
	});
	const [predicting, setPredicting] = useState(false);
	const [saving, setSaving] = useState(false);
	const [training, setTraining] = useState(false);
	const [results, setResults] = useState(null);
	const [majority, setMajority] = useState("");

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const token = localStorage.getItem("token");
				const resp = await axios.get(API_BASE + "/vendors", { headers: { Authorization: `Bearer ${token}` }});
				setVendors(resp.data.vendors || []);
			} catch (e) {
				showError("Failed to load vendors");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const vendorName = useMemo(() => vendors.find(v => v._id === form.vendorId)?.name || "", [vendors, form.vendorId]);

	const onChange = (e) => {
		const { name, value } = e.target;
		setForm(p => ({ ...p, [name]: value }));
	};

	const handlePredict = async () => {
		try {
			setPredicting(true);
			setResults(null);
			setMajority("");
			const lengthCm = Number(form.lengthM) * 100; // meters -> centimeters
			const payload = {
				vendor: vendorName || "Unknown",
				woodType: form.woodType,
				length: lengthCm,
				width: Number(form.widthCm),
				thickness: Number(form.thicknessCm),
				moisture: Number(form.moisturePct),
				costPerUnit: Number(form.costPerUnit)
			};
			const resp = await axios.post(API_BASE + '/ml/wood-quality/predict', payload);
			const data = resp.data;
			if (!data.ok) throw new Error(data?.message || 'Prediction failed');
			const r = data.results;
			setResults(r);
			const votes = Object.values(r).map(x => x.prediction);
			const counts = votes.reduce((acc, v) => { acc[v] = (acc[v]||0)+1; return acc; }, {});
			setMajority(Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || "");
		} catch (e) {
			showError(e.response?.data?.message || e.message);
		} finally {
			setPredicting(false);
		}
	};

	const handleSaveSample = async () => {
		if (!majority) return showError("Predict first to determine quality");
		try {
			setSaving(true);
			const token = localStorage.getItem("token");
			await axios.post(API_BASE + "/wood-quality/samples", {
				vendorName: vendorName || "Unknown",
				woodType: form.woodType,
				lengthCm: Number(form.lengthM) * 100, // store in cm
				widthCm: Number(form.widthCm),
				thicknessCm: Number(form.thicknessCm),
				moisturePct: Number(form.moisturePct),
				costPerUnit: Number(form.costPerUnit),
				quality: majority
			}, { headers: { Authorization: `Bearer ${token}` }});
			showSuccess("Sample saved");
		} catch (e) {
			showError(e.response?.data?.message || e.message);
		} finally {
			setSaving(false);
		}
	};

	const handleTrain = async () => {
		try {
			setTraining(true);
			const token = localStorage.getItem("token");
			await axios.post(API_BASE + "/wood-quality/train", {}, { headers: { Authorization: `Bearer ${token}` }});
			showSuccess("Training started/completed");
		} catch (e) {
			showError(e.response?.data?.message || e.message);
		} finally {
			setTraining(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-gray-600">Loading vendors…</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<h1 className="text-2xl font-bold text-gray-900">Wood Quality (ML)</h1>
					<p className="text-sm text-gray-600">Welcome, {user?.name}</p>
				</div>
			</header>
			<main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="bg-white rounded-lg shadow p-5">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm mb-1">Vendor</label>
							<select name="vendorId" value={form.vendorId} onChange={onChange} className="w-full border rounded p-2">
								<option value="">Select vendor</option>
								{vendors.map(v => (
									<option key={v._id} value={v._id}>{v.name}</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm mb-1">Wood Type</label>
							<select name="woodType" value={form.woodType} onChange={onChange} className="w-full border rounded p-2">
								<option>Teak</option>
								<option>Mahogany</option>
								<option>Pine</option>
								<option>Rosewood</option>
								<option>Oak</option>
								<option>Cedar</option>
								<option>Bamboo</option>
								<option>Plywood</option>
								<option>Other</option>
							</select>
						</div>
						<div>
							<label className="block text-sm mb-1">Length (m)</label>
							<input name="lengthM" type="number" step="0.01" value={form.lengthM} onChange={onChange} className="w-full border rounded p-2"/>
						</div>
						<div>
							<label className="block text-sm mb-1">Width (cm)</label>
							<input name="widthCm" type="number" step="0.1" value={form.widthCm} onChange={onChange} className="w-full border rounded p-2"/>
						</div>
						<div>
							<label className="block text-sm mb-1">Thickness (cm)</label>
							<input name="thicknessCm" type="number" step="0.1" value={form.thicknessCm} onChange={onChange} className="w-full border rounded p-2"/>
						</div>
						<div>
							<label className="block text-sm mb-1">Moisture (%)</label>
							<input name="moisturePct" type="number" step="0.1" value={form.moisturePct} onChange={onChange} className="w-full border rounded p-2"/>
						</div>
						<div>
							<label className="block text-sm mb-1">Cost per unit (₹/cft)</label>
							<input name="costPerUnit" type="number" step="0.1" value={form.costPerUnit} onChange={onChange} className="w-full border rounded p-2"/>
						</div>
					</div>
					<div className="mt-4 flex flex-wrap items-center gap-3">
						<button onClick={handlePredict} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={predicting || !form.vendorId}>
							{predicting ? 'Predicting…' : 'Predict'}
						</button>
						<button onClick={handleSaveSample} className="px-4 py-2 bg-gray-800 text-white rounded" disabled={saving || !majority}>
							{saving ? 'Saving…' : 'Save as Training Sample'}
						</button>
						<button onClick={handleTrain} className="px-4 py-2 bg-green-600 text-white rounded" disabled={training}>
							{training ? 'Training…' : 'Train Models'}
						</button>
					</div>
					{results && (
						<div className="mt-6">
							<div className="text-lg font-semibold">Majority: <span className="text-blue-700">{majority}</span></div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
								{Object.entries(results).map(([model, r]) => (
									<div key={model} className="border rounded p-3">
										<div className="font-medium">{model}</div>
										<div>Prediction: <span className="font-semibold">{r.prediction}</span></div>
										{r.probabilities && (
											<div className="mt-1 text-sm text-gray-600">
												{Object.entries(r.probabilities).map(([k,v]) => (
													<div key={k} className="flex justify-between"><span>{k}</span><span>{(v*100).toFixed(1)}%</span></div>
												))}
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
