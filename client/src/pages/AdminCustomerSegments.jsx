import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

export default function AdminCustomerSegments() {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filter, setFilter] = useState('All');

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setLoading(true);
				setError(null);
				const res = await api.get('/segmentation/snapshot');
				if (mounted && res.data?.ok) {
					setRows(res.data.results || []);
				} else if (mounted) {
					setRows([]);
				}
			} catch (e) {
				setError('Failed to load customer segments');
				setRows([]);
			} finally {
				setLoading(false);
			}
		})();
		return () => { mounted = false; };
	}, []);

	const filtered = useMemo(() => {
		if (filter === 'All') return rows;
		return rows.filter(r => r.segment === filter);
	}, [rows, filter]);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-heading text-dark-brown mb-4">Customer Segmentation</h1>
			<p className="text-sm text-gray-600 mb-6">Segments computed from orders using Gaussian Naive Bayes.</p>

			<div className="flex items-center gap-3 mb-4">
				<label className="text-sm text-gray-700">Filter:</label>
				<select
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					className="border rounded px-2 py-1 text-sm"
				>
					<option>All</option>
					<option>Premium</option>
					<option>Value</option>
					<option>Basic</option>
				</select>
			</div>

			{loading && <div>Loading...</div>}
			{error && <div className="text-red-600">{error}</div>}

			{!loading && !error && (
				<div className="overflow-x-auto border rounded-lg">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order Value</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Rate</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 bg-white">
							{filtered.map((r) => {
								const probs = r.probabilities || {};
								const conf = typeof probs[r.segment] === 'number' ? (probs[r.segment] * 100).toFixed(1) + '%' : '-';
								return (
									<tr key={r.customerId}>
										<td className="px-4 py-2 text-sm text-gray-800">
											<div className="flex flex-col">
												<span className="font-medium">{r.user?.name || '—'}</span>
												<span className="text-xs text-gray-500">{r.user?.email || r.customerId}</span>
											</div>
										</td>
										<td className="px-4 py-2 text-sm">
											<span className={
												`px-2 py-0.5 rounded text-white text-xs ${r.segment === 'Premium' ? 'bg-green-600' : r.segment === 'Value' ? 'bg-blue-600' : 'bg-gray-600'}`
											}>
												{r.segment}
											</span>
										</td>
										<td className="px-4 py-2 text-sm text-gray-800">{conf}</td>
										<td className="px-4 py-2 text-sm text-gray-800">{r.features?.totalOrders ?? '-'}</td>
										<td className="px-4 py-2 text-sm text-gray-800">{r.features?.avgOrderValue?.toFixed ? r.features.avgOrderValue.toFixed(0) : r.features?.avgOrderValue}</td>
										<td className="px-4 py-2 text-sm text-gray-800">{r.features?.categoriesPurchased ?? '-'}</td>
										<td className="px-4 py-2 text-sm text-gray-800">{r.features?.returnRate?.toFixed ? (r.features.returnRate * 100).toFixed(1) + '%' : r.features?.returnRate}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}


