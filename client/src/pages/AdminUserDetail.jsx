import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { API_BASE } from '../config';
import { useNotification } from '../components/NotificationProvider';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';
import StatusBadge, {
  accountStatusDisplay,
  orderStatusTone,
} from '../components/admin/StatusBadge';

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'enquiries', label: 'Enquiries' },
  { id: 'aftersale', label: 'After-sale' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'account', label: 'Account' },
];

function formatINR(n) {
  if (n == null || Number.isNaN(Number(n))) return '₹0';
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

function formatActivityTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initials(name) {
  if (!name || !String(name).trim()) return '?';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarBg(name) {
  let h = 0;
  const s = String(name || '');
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * 17) % 360;
  return `hsl(${h} 45% 40%)`;
}

function orderLineTotal(o) {
  if (o.totalAmount != null) return o.totalAmount;
  if (o.total != null) return o.total;
  if (!o.items?.length) return 0;
  return o.items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0);
}

function countOpenEnquiries(list) {
  return list.filter((e) => {
    if (e.kind === 'general') {
      return !['Rejected', 'Converted to Order'].includes(e.status);
    }
    return !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(e.status);
  }).length;
}

function countOpenAfterSale(list) {
  return list.filter((r) => !['completed', 'closed'].includes(r.status)).length;
}

function enquiryStatusTone(status, kind) {
  if (kind === 'timber') {
    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(status)) return 'gray';
    if (['IN_PROGRESS', 'SCHEDULED'].includes(status)) return 'blue';
    return 'amber';
  }
  if (['Rejected'].includes(status)) return 'red';
  if (['Converted to Order', 'Accepted'].includes(status)) return 'green';
  return 'amber';
}

function afterSaleTone(status) {
  if (['completed', 'closed'].includes(status)) return 'green';
  if (['rejected'].includes(status)) return 'red';
  return 'amber';
}

function TabSkeleton() {
  return (
    <div className="space-y-2 animate-pulse py-4">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
    </div>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [afterSales, setAfterSales] = useState([]);

  const [headerLoading, setHeaderLoading] = useState(true);
  const [headerError, setHeaderError] = useState(null);

  const [activeTab, setActiveTab] = useState('orders');
  const [tabError, setTabError] = useState({});
  const [tabLoading, setTabLoading] = useState({});

  const [reviews, setReviews] = useState([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [accountExtraLoaded, setAccountExtraLoaded] = useState(false);

  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);

  const [statusModal, setStatusModal] = useState({ open: false, action: null });
  const [statusReason, setStatusReason] = useState('');

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  const loadHeaderBundle = useCallback(async () => {
    setHeaderLoading(true);
    setHeaderError(null);
    const h = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      const settled = await Promise.allSettled([
        fetch(`${API_BASE}/admin/users/${id}`, { headers: h }).then(async (r) => {
          const data = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(data.message || 'Failed to load user');
          return data;
        }),
        fetch(`${API_BASE}/admin/users/${id}/orders`, { headers: h }).then(async (r) => {
          const data = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(data.message || 'Failed to load orders');
          return data;
        }),
        fetch(`${API_BASE}/admin/users/${id}/enquiries`, { headers: h }).then(async (r) => {
          const data = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(data.message || 'Failed to load enquiries');
          return data;
        }),
        fetch(`${API_BASE}/admin/users/${id}/after-sale`, { headers: h }).then(async (r) => {
          const data = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(data.message || 'Failed to load after-sale');
          return data;
        }),
      ]);

      const [uRes, oRes, eRes, aRes] = settled;

      if (uRes.status === 'fulfilled' && uRes.value?.success && uRes.value.user) {
        setUser(uRes.value.user);
      } else {
        setUser(null);
        setHeaderError(
          uRes.status === 'fulfilled'
            ? uRes.value?.message || 'User not found or access denied'
            : uRes.reason?.message || 'User not found or access denied'
        );
      }

      if (oRes.status === 'fulfilled') {
        setOrders(oRes.value.orders || []);
        setTabError((prev) => ({ ...prev, orders: null }));
      } else {
        setOrders([]);
        setTabError((prev) => ({
          ...prev,
          orders: oRes.reason?.message || 'Failed to load orders',
        }));
      }

      if (eRes.status === 'fulfilled') {
        setEnquiries(eRes.value.enquiries || []);
        setTabError((prev) => ({ ...prev, enquiries: null }));
      } else {
        setEnquiries([]);
        setTabError((prev) => ({
          ...prev,
          enquiries: eRes.reason?.message || 'Failed to load enquiries',
        }));
      }

      if (aRes.status === 'fulfilled') {
        setAfterSales(aRes.value.requests || []);
        setTabError((prev) => ({ ...prev, aftersale: null }));
      } else {
        setAfterSales([]);
        setTabError((prev) => ({
          ...prev,
          aftersale: aRes.reason?.message || 'Failed to load after-sale',
        }));
      }
    } catch (e) {
      setHeaderError(e.message);
    } finally {
      setHeaderLoading(false);
    }
  }, [id]);

  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    setActivityError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}/activity`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed to load activity');
      const data = await res.json();
      setActivity(data.activity || []);
    } catch (e) {
      setActivityError(e.message);
      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadHeaderBundle();
    loadActivity();
  }, [loadHeaderBundle, loadActivity]);

  useEffect(() => {
    if (activeTab !== 'reviews' || reviewsLoaded) return;
    let cancelled = false;
    (async () => {
      setTabLoading((p) => ({ ...p, reviews: true }));
      setTabError((p) => ({ ...p, reviews: null }));
      try {
        const res = await fetch(`${API_BASE}/admin/users/${id}/reviews`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to load reviews');
        const data = await res.json();
        if (!cancelled) {
          setReviews(data.reviews || []);
          setReviewsLoaded(true);
        }
      } catch (e) {
        if (!cancelled) setTabError((p) => ({ ...p, reviews: e.message }));
      } finally {
        if (!cancelled) setTabLoading((p) => ({ ...p, reviews: false }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, reviewsLoaded, id]);

  useEffect(() => {
    if (activeTab !== 'account' || accountExtraLoaded) return;
    let cancelled = false;
    (async () => {
      setTabLoading((p) => ({ ...p, account: true }));
      setTabError((p) => ({ ...p, account: null }));
      const h = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      try {
        const [cRes, wRes] = await Promise.all([
          fetch(`${API_BASE}/admin/users/${id}/cart`, { headers: h }).then((r) => r.json()),
          fetch(`${API_BASE}/admin/users/${id}/wishlist`, { headers: h }).then((r) => r.json()),
        ]);
        if (!cancelled) {
          setCart(cRes.cart || { items: [], total: 0 });
          setWishlist(wRes.wishlist || []);
          setAccountExtraLoaded(true);
        }
      } catch (e) {
        if (!cancelled) setTabError((p) => ({ ...p, account: e.message }));
      } finally {
        if (!cancelled) setTabLoading((p) => ({ ...p, account: false }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, accountExtraLoaded, id]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const lifetimeSpend = orders.reduce((s, o) => s + orderLineTotal(o), 0);
    const openEnq = countOpenEnquiries(enquiries);
    const openAs = countOpenAfterSale(afterSales);
    return { totalOrders, lifetimeSpend, openEnq, openAs };
  }, [orders, enquiries, afterSales]);

  const accDisplay = accountStatusDisplay(user?.status);

  const confirmStatusChange = async () => {
    const reason = statusReason.trim();
    if (!reason || !statusModal.action) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: statusModal.action, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Update failed');
      showSuccess(data.message || 'Status updated');
      if (data.user) {
        setUser((prev) => (prev ? { ...prev, status: data.user.status } : prev));
      }
      if (data.activity) {
        setActivity((prev) => [data.activity, ...prev]);
      } else {
        loadActivity();
      }
      setStatusModal({ open: false, action: null });
      setStatusReason('');
    } catch (e) {
      showError(e.message);
    }
  };

  const toggleReviewVisibility = async (review) => {
    const next = review.status === 'Approved' ? 'Rejected' : 'Approved';
    try {
      const res = await fetch(`${API_BASE}/reviews/admin/${review._id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Update failed');
      }
      showSuccess(next === 'Approved' ? 'Review published' : 'Review hidden');
      setReviews((prev) =>
        prev.map((r) => (r._id === review._id ? { ...r, status: next } : r))
      );
    } catch (e) {
      showError(e.message);
    }
  };

  const retryTab = useCallback(
    (key) => {
      if (key === 'reviews') {
        setReviewsLoaded(false);
        return;
      }
      if (key === 'account') {
        setAccountExtraLoaded(false);
        return;
      }
      if (key === 'header') {
        loadHeaderBundle();
        loadActivity();
        return;
      }
      loadHeaderBundle();
    },
    [loadHeaderBundle, loadActivity]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                ← Users
              </button>
            </div>

            {headerError && (
              <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg border border-red-200 flex flex-wrap items-center gap-3">
                {headerError}
                <button
                  type="button"
                  className="text-blue-600 underline text-sm"
                  onClick={() => retryTab('header')}
                >
                  Retry
                </button>
              </div>
            )}

            {headerLoading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded w-1/2" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            ) : user ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 flex flex-col lg:flex-row lg:items-start gap-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0"
                    style={{ backgroundColor: avatarBg(user.name) }}
                  >
                    {initials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 gap-y-2">
                      <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                      <StatusBadge tone={accDisplay.tone}>{accDisplay.label}</StatusBadge>
                    </div>
                    <p className="text-gray-600 mt-1">{user.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Joined{' '}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <label className="text-sm text-gray-600 mr-1">Change status:</label>
                      <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                        defaultValue=""
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === 'active' || v === 'suspended' || v === 'banned') {
                            setStatusModal({ open: true, action: v });
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="" disabled>
                          Choose action…
                        </option>
                        <option value="active">Activate</option>
                        <option value="suspended">Suspend</option>
                        <option value="banned">Ban</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto lg:min-w-[420px]">
                    {[
                      { label: 'Total orders', value: stats.totalOrders },
                      { label: 'Lifetime spend', value: formatINR(stats.lifetimeSpend) },
                      { label: 'Open enquiries', value: stats.openEnq },
                      { label: 'Open after-sale', value: stats.openAs },
                    ].map((pill) => (
                      <div
                        key={pill.label}
                        className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-center"
                      >
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {pill.label}
                        </div>
                        <div className="text-lg font-semibold text-gray-900 mt-0.5">{pill.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-2 md:px-4 overflow-x-auto">
                <div className="flex gap-1 min-w-max py-2">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === t.id
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 md:p-6">
                {activeTab === 'orders' && (
                  <>
                    {tabError.orders ? (
                      <div className="text-red-600 text-sm">
                        Failed to load —{' '}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => retryTab('orders')}
                        >
                          retry
                        </button>
                      </div>
                    ) : headerLoading ? (
                      <TabSkeleton />
                    ) : orders.length === 0 ? (
                      <p className="text-gray-500 text-sm">No orders yet</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b text-left text-gray-500">
                              <th className="pb-2 pr-4">Order ID</th>
                              <th className="pb-2 pr-4">Date</th>
                              <th className="pb-2 pr-4">Items</th>
                              <th className="pb-2 pr-4">Total</th>
                              <th className="pb-2 pr-4">Status</th>
                              <th className="pb-2"> </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {orders.map((o) => (
                              <tr key={o._id}>
                                <td className="py-2 pr-4 font-mono text-xs">
                                  #{String(o._id).slice(-8).toUpperCase()}
                                </td>
                                <td className="py-2 pr-4 whitespace-nowrap">
                                  {o.createdAt
                                    ? new Date(o.createdAt).toLocaleDateString()
                                    : '—'}
                                </td>
                                <td className="py-2 pr-4">{o.items?.length ?? 0}</td>
                                <td className="py-2 pr-4">{formatINR(orderLineTotal(o))}</td>
                                <td className="py-2 pr-4">
                                  <StatusBadge tone={orderStatusTone(o.status)}>{o.status}</StatusBadge>
                                </td>
                                <td className="py-2">
                                  <Link
                                    to={`/admin/orders/${o._id}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    View
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'enquiries' && (
                  <>
                    {tabError.enquiries ? (
                      <div className="text-red-600 text-sm">
                        Failed to load —{' '}
                        <button type="button" className="underline" onClick={() => retryTab('enquiries')}>
                          retry
                        </button>
                      </div>
                    ) : headerLoading ? (
                      <TabSkeleton />
                    ) : enquiries.length === 0 ? (
                      <p className="text-gray-500 text-sm">No enquiries yet</p>
                    ) : (
                      <div className="overflow-x-auto space-y-3">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b text-left text-gray-500">
                              <th className="pb-2 pr-4">Type</th>
                              <th className="pb-2 pr-4">Submitted</th>
                              <th className="pb-2 pr-4">Status</th>
                              <th className="pb-2">Summary</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {enquiries.map((e) => (
                              <tr key={`${e.kind}-${e._id}`}>
                                <td className="py-2 pr-4">
                                  {e.kind === 'timber' ? 'Timber Processing' : 'General'}
                                </td>
                                <td className="py-2 pr-4 whitespace-nowrap">
                                  {e.createdAt
                                    ? new Date(e.createdAt).toLocaleDateString()
                                    : '—'}
                                </td>
                                <td className="py-2 pr-4">
                                  <StatusBadge tone={enquiryStatusTone(e.status, e.kind)}>
                                    {e.status}
                                  </StatusBadge>
                                </td>
                                <td className="py-2 text-gray-700 max-w-md truncate">
                                  {e.summary || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'aftersale' && (
                  <>
                    {tabError.aftersale ? (
                      <div className="text-red-600 text-sm">
                        Failed to load —{' '}
                        <button type="button" className="underline" onClick={() => retryTab('aftersale')}>
                          retry
                        </button>
                      </div>
                    ) : headerLoading ? (
                      <TabSkeleton />
                    ) : afterSales.length === 0 ? (
                      <p className="text-gray-500 text-sm">No after-sale requests yet</p>
                    ) : (
                      <div className="space-y-4">
                        {afterSales.map((r) => (
                          <div
                            key={r._id}
                            className="border border-gray-100 rounded-lg p-4 bg-gray-50/50"
                          >
                            <div className="flex flex-wrap justify-between gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Request</span>
                                <div className="font-mono text-xs">
                                  #{String(r._id).slice(-8).toUpperCase()}
                                </div>
                              </div>
                              <div>
                                {r.createdAt
                                  ? new Date(r.createdAt).toLocaleDateString()
                                  : '—'}
                              </div>
                              <StatusBadge tone={afterSaleTone(r.status)}>{r.status}</StatusBadge>
                            </div>
                            <div className="mt-2 text-sm text-gray-800">
                              <span className="text-gray-500">Type:</span>{' '}
                              {r.serviceType?.replace(/_/g, ' ') || '—'}
                            </div>
                            {r.issueDescription && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.issueDescription}</p>
                            )}
                            {r.status === 'completed' &&
                              r.feedback &&
                              r.feedback.rating != null && (
                                <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                                  <div className="flex items-center gap-1 text-amber-500">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span key={star}>{star <= r.feedback.rating ? '★' : '☆'}</span>
                                    ))}
                                  </div>
                                  {r.feedback.comment && (
                                    <p className="text-gray-700 mt-1">{r.feedback.comment}</p>
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'reviews' && (
                  <>
                    {tabError.reviews ? (
                      <div className="text-red-600 text-sm">
                        Failed to load —{' '}
                        <button type="button" className="underline" onClick={() => retryTab('reviews')}>
                          retry
                        </button>
                      </div>
                    ) : tabLoading.reviews ? (
                      <TabSkeleton />
                    ) : reviews.length === 0 ? (
                      <p className="text-gray-500 text-sm">No reviews yet</p>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((rev) => {
                          const published = rev.status === 'Approved';
                          return (
                            <div
                              key={rev._id}
                              className="border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row md:justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900">
                                  {rev.product?.name || 'Product'}
                                </div>
                                <div className="flex text-amber-500 text-sm mt-1">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s}>{s <= rev.rating ? '★' : '☆'}</span>
                                  ))}
                                </div>
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                  {rev.reviewText || rev.reviewTitle || '—'}
                                </p>
                                <div className="text-xs text-gray-500 mt-2">
                                  {rev.createdAt
                                    ? new Date(rev.createdAt).toLocaleDateString()
                                    : ''}
                                </div>
                                <StatusBadge tone={published ? 'green' : 'gray'} className="mt-2">
                                  {published ? 'Published' : 'Hidden'}
                                </StatusBadge>
                              </div>
                              <div className="shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleReviewVisibility(rev)}
                                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                                >
                                  {published ? 'Hide' : 'Publish'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'account' && (
                  <>
                    {tabLoading.account ? (
                      <TabSkeleton />
                    ) : tabError.account ? (
                      <div className="text-red-600 text-sm">
                        Failed to load —{' '}
                        <button type="button" className="underline" onClick={() => retryTab('account')}>
                          retry
                        </button>
                      </div>
                    ) : !user ? null : (
                      <div className="space-y-6 text-sm">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-500 block">Full name</span>
                            <span className="font-medium text-gray-900">{user.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Email</span>
                            <span className="font-medium text-gray-900">{user.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Phone</span>
                            <span className="font-medium text-gray-900">{user.phone || '—'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Last login</span>
                            <span className="font-medium text-gray-900">
                              {user.lastLogin
                                ? new Date(user.lastLogin).toLocaleString()
                                : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">2FA</span>
                            <span className="font-medium text-gray-900">
                              {user.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Account status</span>
                            <StatusBadge tone={accDisplay.tone}>{accDisplay.label}</StatusBadge>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Addresses</h3>
                          {!user.addresses?.length ? (
                            <p className="text-gray-500">No saved addresses</p>
                          ) : (
                            <ul className="space-y-2">
                              {user.addresses.map((addr) => (
                                <li
                                  key={addr._id}
                                  className="border border-gray-100 rounded-lg p-3 bg-gray-50"
                                >
                                  <div className="font-medium">{addr.fullName}</div>
                                  <div className="text-gray-600">
                                    {addr.flatHouseCompany}, {addr.address}, {addr.city}, {addr.state}{' '}
                                    {addr.pincode}
                                  </div>
                                  <div className="text-gray-500 text-xs mt-1">
                                    {addr.mobileNumber} · {addr.addressType}
                                    {addr.isDefault ? ' · Default' : ''}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Cart</h3>
                          {!cart?.items?.length ? (
                            <p className="text-gray-500">Cart is empty</p>
                          ) : (
                            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                              {cart.items.map((item, idx) => (
                                <li key={idx} className="px-3 py-2 flex justify-between">
                                  <span>
                                    {item.name} × {item.quantity}
                                  </span>
                                  <span className="text-gray-600">{formatINR(item.subtotal)}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {cart?.items?.length > 0 && (
                            <div className="mt-2 font-medium">
                              Total: {formatINR(cart.total)}
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Wishlist</h3>
                          {!wishlist.length ? (
                            <p className="text-gray-500">Wishlist is empty</p>
                          ) : (
                            <ul className="space-y-1">
                              {wishlist.map((w) => (
                                <li key={w._id} className="text-gray-800">
                                  {w.name} — {formatINR(w.price)}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Activity log */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity log</h2>
              {activityLoading ? (
                <TabSkeleton />
              ) : activityError ? (
                <div className="text-red-600 text-sm flex flex-wrap items-center gap-2">
                  Failed to load — {activityError}
                  <button
                    type="button"
                    className="underline text-blue-600"
                    onClick={() => loadActivity()}
                  >
                    retry
                  </button>
                </div>
              ) : activity.length === 0 ? (
                <p className="text-gray-500 text-sm">No activity recorded yet</p>
              ) : (
                <ul className="space-y-4">
                  {activity.map((entry, i) => (
                    <li key={i} className="flex gap-3">
                      <div
                        className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 shrink-0"
                        title={entry.type}
                      >
                        {entry.actionKey || entry.type?.[0]?.toUpperCase() || '·'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900">{entry.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {entry.adminName || 'Admin'} · {formatActivityTime(entry.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {statusModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900">Confirm status change</h3>
            <p className="text-sm text-gray-600 mt-2">
              {statusModal.action === 'active' && (
                <>Activate account for &quot;{user?.name}&quot;?</>
              )}
              {statusModal.action === 'suspended' && (
                <>Suspend account for &quot;{user?.name}&quot;?</>
              )}
              {statusModal.action === 'banned' && <>Ban account for &quot;{user?.name}&quot;?</>}
            </p>
            <label className="block mt-4 text-sm font-medium text-gray-700">
              Reason (required)
              <textarea
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Explain why this action is taken…"
              />
            </label>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setStatusModal({ open: false, action: null });
                  setStatusReason('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!statusReason.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white disabled:opacity-40"
                onClick={confirmStatusChange}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
