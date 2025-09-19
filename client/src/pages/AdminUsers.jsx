import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) throw new Error('Admin access required');
      if (!res.ok) throw new Error('Failed to load customers');
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (userId) => {
    try {
      setDetails(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load user details');
      const data = await res.json();
      setDetails(data);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Customer accounts and activities</p>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} className="px-4 py-2 rounded-lg bg-gray-800 text-white">Back</button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading customers...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Customers</h2>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {customers.length === 0 && (
                  <div className="text-gray-500 text-sm">No customers found.</div>
                )}
                {customers.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => { setSelected(u); fetchDetails(u._id); }}
                    className={`w-full text-left p-3 rounded-lg border ${selected?._id === u._id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-xs text-gray-600">{u.email}</div>
                    <div className="text-xs text-gray-500 mt-1">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Customer Details</h2>
              {!selected && (
                <div className="text-gray-500">Select a customer to view details</div>
              )}
              {selected && !details && (
                <div className="text-gray-500">Loading details...</div>
              )}
              {selected && details && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50">
                      <div className="text-sm text-blue-800">Name</div>
                      <div className="text-lg font-semibold text-blue-900">{details.user.name}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50">
                      <div className="text-sm text-green-800">Email</div>
                      <div className="text-lg font-semibold text-green-900">{details.user.email}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50">
                      <div className="text-sm text-purple-800">Joined</div>
                      <div className="text-lg font-semibold text-purple-900">{new Date(details.user.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cart Items</h3>
                    <div className="space-y-2">
                      {details.cart.items?.length === 0 && (
                        <div className="text-sm text-gray-500">Cart is empty.</div>
                      )}
                      {details.cart.items?.map((ci, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{ci.product?.name || 'Unknown Product'}</div>
                            <div className="text-xs text-gray-500">Qty: {ci.quantity}</div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ₹{(ci.product?.price || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Orders</h3>
                    <div className="space-y-2">
                      {details.orders.length === 0 && (
                        <div className="text-sm text-gray-500">No orders yet.</div>
                      )}
                      {details.orders.map((o) => (
                        <div key={o._id} className="p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">Order ID: {o._id}</div>
                              <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                o.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                o.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}>{o.status}</span>
                              <div className="text-sm font-semibold text-gray-900 mt-1">₹{o.totalAmount.toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">Payment: {o.paymentMethod}</div>
                          <div className="mt-2 text-sm text-gray-800">Items: {o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}






