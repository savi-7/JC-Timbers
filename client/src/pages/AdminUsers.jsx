import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE } from '../config';
import StatusBadge, {
  accountStatusDisplay,
  accountStatusFilterGroup,
} from '../components/admin/StatusBadge';

function formatINR(n) {
  if (n == null || Number.isNaN(Number(n))) return '₹0';
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

function formatLastActive(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | suspended | banned | flagged
  const [signalFilter, setSignalFilter] = useState(''); // overdue-enquiries | overdue-after-sale | unhappy-customers
  const [signalUserIds, setSignalUserIds] = useState(null); // Set<string> | null

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await fetch(API_BASE + '/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) throw new Error('Admin access required');
      if (!res.ok) throw new Error('Failed to load customers');
      const data = await res.json();
      setCustomers(data.users || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Initialize filters from query params (for dashboard links)
  useEffect(() => {
    const status = (searchParams.get('status') || '').toLowerCase();
    const signal = (searchParams.get('signal') || '').toLowerCase();
    if (status) {
      if (['all', 'active', 'suspended', 'banned'].includes(status)) setStatusFilter(status);
      if (status === 'flagged') setStatusFilter('flagged');
    }
    if (signal) setSignalFilter(signal);
  }, [searchParams]);

  // Fetch datasets only when a signal filter is requested
  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const isAfterSaleOpen = (s) => !['completed', 'closed'].includes(s);
    const isServiceOpen = (s) => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(s);

    const run = async () => {
      if (!signalFilter) {
        setSignalUserIds(null);
        return;
      }
      try {
        // Pull only what we need for the signals
        const [genEnqRes, svcEnqRes, afterSaleRes] = await Promise.all([
          fetch(`${API_BASE}/admin/enquiries`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE}/services/admin/enquiries`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE}/admin/after-sale?limit=100&page=1`, { headers }).then((r) => r.json()),
        ]);

        const general = Array.isArray(genEnqRes) ? genEnqRes : (genEnqRes?.enquiries || []);
        const service = svcEnqRes?.enquiries || [];
        const afterSale = afterSaleRes?.requests || [];

        const now = Date.now();
        const hours24Ago = new Date(now - 24 * 60 * 60 * 1000);
        const days7Ago = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const days30Ago = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const ids = new Set();

        if (signalFilter === 'overdue-enquiries') {
          general.forEach((e) => {
            if (!e?.createdAt) return;
            if (['Rejected', 'Converted to Order'].includes(e.status)) return;
            if (new Date(e.createdAt) < hours24Ago) ids.add(String(e.user));
          });
          service.forEach((e) => {
            if (!e?.createdAt) return;
            if (!isServiceOpen(e.status)) return;
            if (new Date(e.createdAt) < hours24Ago) ids.add(String(e.customerId?._id || e.customerId));
          });
        }

        if (signalFilter === 'overdue-after-sale') {
          afterSale.forEach((r) => {
            if (!r?.createdAt) return;
            if (!isAfterSaleOpen(r.status)) return;
            if (new Date(r.createdAt) < days7Ago) ids.add(String(r.customerId?._id || r.customerId));
          });
        }

        if (signalFilter === 'unhappy-customers') {
          afterSale.forEach((r) => {
            if (r?.status !== 'completed') return;
            const rating = r?.feedback?.rating;
            if (!(rating === 1 || rating === 2)) return;
            const t = r.feedback?.submittedAt || r.updatedAt || r.createdAt;
            if (t && new Date(t) >= days30Ago) ids.add(String(r.customerId?._id || r.customerId));
          });
        }

        if (!cancelled) setSignalUserIds(ids);
      } catch (e) {
        if (!cancelled) setSignalUserIds(new Set());
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [signalFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((u) => {
      const group = accountStatusFilterGroup(u.status);
      if (statusFilter === 'flagged') {
        if (!(group === 'suspended' || group === 'banned')) return false;
      } else if (statusFilter !== 'all' && group !== statusFilter) {
        return false;
      }
      if (signalFilter && signalUserIds) {
        if (!signalUserIds.has(String(u._id))) return false;
      }
      if (!q) return true;
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [customers, search, statusFilter, signalFilter, signalUserIds]);

  const pillBtn = (key, label) => (
    <button
      type="button"
      onClick={() => setStatusFilter(key)}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        statusFilter === key
          ? 'bg-gray-900 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Customer accounts and activities</p>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white"
          >
            Back
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <div className="flex flex-wrap items-center gap-2">
            {pillBtn('all', 'All')}
            {pillBtn('active', 'Active')}
            {pillBtn('suspended', 'Suspended')}
            {pillBtn('banned', 'Banned')}
          </div>
        </div>

        {signalFilter && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4 text-sm flex flex-wrap items-center gap-2">
            Showing users matching signal: <span className="font-medium">{signalFilter}</span>
            <button
              type="button"
              className="underline"
              onClick={() => {
                setSignalFilter('');
                setSignalUserIds(null);
                navigate('/admin/users', { replace: true });
              }}
            >
              Clear
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded mb-4 flex flex-wrap items-center gap-3">
            {error}
            <button type="button" className="underline text-sm" onClick={fetchCustomers}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-3 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-5/6" />
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-gray-600 uppercase text-xs tracking-wider">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Joined</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Last active</th>
                    <th className="px-4 py-3 font-medium text-right">Orders</th>
                    <th className="px-4 py-3 font-medium text-right whitespace-nowrap">
                      Lifetime spend
                    </th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        No customers match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => {
                      const acc = accountStatusDisplay(u.status);
                      const orderCount = u.orderCount ?? 0;
                      const spend = u.lifetimeSpend ?? 0;
                      return (
                        <tr key={u._id} className="hover:bg-gray-50/80">
                          <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                          <td className="px-4 py-3 text-gray-700">{u.email}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {formatLastActive(u.lastLogin)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">{orderCount}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium">
                            {formatINR(spend)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge tone={acc.tone}>{acc.label}</StatusBadge>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              to={`/admin/users/${u._id}`}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-200">
              Showing {filtered.length} of {customers.length} customers
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
