import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';
import { API_BASE } from '../config';
import StatusBadge, { orderStatusTone } from '../components/admin/StatusBadge';

function formatINR(n) {
  if (n == null) return '—';
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const msg = (await res.json().catch(() => ({}))).message || 'Failed to load order';
          throw new Error(msg);
        }
        const data = await res.json();
        if (!cancelled) setOrder(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800">
                All orders
              </Link>
            </div>

            {loading && (
              <div className="space-y-3 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-24 bg-gray-200 rounded" />
                <div className="h-40 bg-gray-200 rounded" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {!loading && !error && order && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Order</h1>
                    <p className="text-sm text-gray-500 font-mono mt-1">
                      #{String(order._id).slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <StatusBadge tone={orderStatusTone(order.status)}>{order.status}</StatusBadge>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total</span>
                      <div className="font-semibold text-gray-900">{formatINR(order.totalAmount)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Date</span>
                      <div className="font-medium text-gray-900">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment</span>
                      <div className="font-medium text-gray-900">
                        {order.paymentMethod} — {order.paymentStatus}
                      </div>
                    </div>
                    {order.user && (
                      <div>
                        <span className="text-gray-500">Customer</span>
                        <div className="font-medium text-gray-900">{order.user.name}</div>
                        <div className="text-gray-600">{order.user.email}</div>
                        {(order.user._id || order.user) && (
                          <Link
                            to={`/admin/users/${order.user._id || order.user}`}
                            className="text-blue-600 text-sm hover:underline mt-1 inline-block"
                          >
                            View user profile
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {order.address && (
                    <div className="bg-gray-50 rounded-lg p-4 text-sm">
                      <h3 className="font-semibold text-gray-900 mb-2">Shipping address</h3>
                      <p className="text-gray-800">{order.address.name}</p>
                      <p className="text-gray-600">{order.address.phone}</p>
                      <p className="text-gray-600 mt-1">
                        {order.address.addressLine}, {order.address.city}, {order.address.state}{' '}
                        {order.address.zip}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
                    <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                      {(order.items || []).map((item, i) => (
                        <li key={i} className="px-4 py-3 flex justify-between text-sm">
                          <span className="text-gray-800">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-gray-600">{formatINR(item.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
