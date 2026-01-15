import { useState } from "react";

export default function WoodQuality() {
	const [form, setForm] = useState({
		vendor: "V001",
		woodType: "Teak",
		length: "220",
		width: "30",
		thickness: "4.0",
		moisture: "8",
		costPerUnit: "950"
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [results, setResults] = useState(null);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((p) => ({ ...p, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setResults(null);
		try {
			const resp = await fetch(`/api/ml/wood-quality/predict`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					vendor: form.vendor,
					woodType: form.woodType,
					length: Number(form.length),
					width: Number(form.width),
					thickness: Number(form.thickness),
					moisture: Number(form.moisture),
					costPerUnit: Number(form.costPerUnit)
				})
			});
			const data = await resp.json();
			if (!resp.ok || !data.ok) {
				throw new Error(data?.message || "Prediction failed");
			}
			setResults(data.results);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto p-4">
			<h1 className="text-2xl font-semibold mb-4">Predict Wood Quality</h1>
			<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm mb-1">Vendor</label>
					<input name="vendor" value={form.vendor} onChange={handleChange} className="w-full border rounded p-2" />
				</div>
				<div>
					<label className="block text-sm mb-1">Wood Type</label>
					<select name="woodType" value={form.woodType} onChange={handleChange} className="w-full border rounded p-2">
						<option>Teak</option>
						<option>Pine</option>
						<option>Mahogany</option>
					</select>
				</div>
				<div>
					<label className="block text-sm mb-1">Length (cm)</label>
					<input name="length" type="number" step="0.1" value={form.length} onChange={handleChange} className="w-full border rounded p-2" />
				</div>
				<div>
					<label className="block text-sm mb-1">Width (cm)</label>
					<input name="width" type="number" step="0.1" value={form.width} onChange={handleChange} className="w-full border rounded p-2" />
				</div>
				<div>
					<label className="block text-sm mb-1">Thickness (cm)</label>
					<input name="thickness" type="number" step="0.1" value={form.thickness} onChange={handleChange} className="w-full border rounded p-2" />
				</div>
				<div>
					<label className="block text-sm mb-1">Moisture (%)</label>
					<input name="moisture" type="number" step="0.1" value={form.moisture} onChange={handleChange} className="w-full border rounded p-2" />
				</div>
				<div>
					<label className="block text-sm mb-1">Cost per unit (₹/cft)</label>
					<input name="costPerUnit" type="number" step="0.1" value={form.costPerUnit} onChange={handleChange} className="w-full border rounded p-2" />
				</div>
				<div className="md:col-span-2">
					<button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
						{loading ? "Predicting..." : "Predict"}
					</button>
				</div>
			</form>
			{error && <p className="text-red-600 mt-4">{error}</p>}
			{results && (
				<div className="mt-6">
					<h2 className="text-xl font-semibold mb-2">Results</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{Object.entries(results).map(([model, r]) => (
							<div key={model} className="border rounded p-3">
								<div className="font-medium">{model}</div>
								<div className="mt-1">Prediction: <span className="font-semibold">{r.prediction}</span></div>
								{r.probabilities && (
									<div className="mt-2 text-sm">
										<div className="text-gray-600">Probabilities:</div>
										{Object.entries(r.probabilities).map(([label, p]) => (
											<div key={label} className="flex justify-between">
												<span>{label}</span>
												<span>{(p*100).toFixed(1)}%</span>
											</div>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
