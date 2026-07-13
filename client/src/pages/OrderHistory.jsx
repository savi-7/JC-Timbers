import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReviewModal from '../components/ReviewModal';
import { generateInvoice } from '../utils/invoiceGenerator';

export default function OrderHistory() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/orders/me');
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
      'Delivered': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    // If it's a base64 data URL, return as-is
    if (image.startsWith('data:')) return image;
    // If it's a full URL, return as-is
    if (image.startsWith('http')) return image;
    // If it's an uploads path, prepend the API URL
    if (image.startsWith('/uploads/')) return `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${image}`;
    // Default: assume it's a filename in uploads
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/uploads/${image}`;
  };

  const handleWriteReview = (item) => {
    setReviewingProduct({
      _id: item.productId || item._id,
      name: item.name,
      price: item.price,
      images: item.image ? [{ data: item.image }] : []
    });
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    // Optionally refresh orders or show a message
    fetchOrders();
  };

  const handleDownloadInvoice = (order) => {
    if (!order) {
      alert('Order data not available. Please try again.');
      return;
    }
    
    try {
      console.log('OrderHistory - Generating invoice for order:', order._id);
      console.log('OrderHistory - Order data:', order);
      generateInvoice(order);
      console.log('OrderHistory - Invoice generated successfully');
    } catch (error) {
      console.error('OrderHistory - Error generating invoice:', error);
      console.error('OrderHistory - Order data was:', order);
      alert(`Failed to generate invoice: ${error.message}\n\nPlease check the console for details.`);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dark-brown mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/customer-profile')}
            className="flex items-center text-dark-brown hover:text-accent-red transition-colors duration-200 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Profile
          </button>
          <h1 className="text-3xl font-heading text-dark-brown">Your Order History</h1>
          <p className="text-gray-600 mt-2">Track and manage all your orders in one place</p>
        </div>

        {error ? (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Orders</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-6 py-2 bg-dark-brown text-white rounded-lg hover:bg-accent-red transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-heading text-dark-brown mb-3">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your order history here.</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3 bg-dark-brown text-white rounded-lg hover:bg-accent-red transition-colors duration-200 font-paragraph"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="text-sm font-mono font-semibold text-dark-brown">#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div className="hidden sm:block w-px h-10 bg-gray-300"></div>
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="text-sm font-medium text-dark-brown">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="hidden sm:block w-px h-10 bg-gray-300"></div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-sm font-bold text-dark-brown">{formatINR(order.totalAmount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200 flex items-center gap-1"
                        title="Download Invoice"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Invoice
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                        }}
                        className="text-sm font-medium text-dark-brown hover:text-accent-red transition-colors duration-200"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Order Items ({order.items?.length || 0})</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus} • {order.paymentMethod}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {order.items?.slice(0, 5).map((item, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    ))}
                    {order.items?.length > 5 && (
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-600">+{order.items.length - 5}</p>
                          <p className="text-xs text-gray-500">more</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Address Preview */}
                {order.address && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Delivery Address</p>
                    <p className="text-sm text-dark-brown font-medium">
                      {order.address.name} • {order.address.phone}
                    </p>
                    <p className="text-xs text-gray-600">
                      {order.address.addressLine}, {order.address.city}, {order.address.state} - {order.address.zip}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-dark-brown">Order Details</h2>
                <p className="text-sm text-gray-600 mt-1">Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Order Status */}
              <div className="bg-gradient-to-r from-dark-brown to-accent-red rounded-lg p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Order Status</p>
                    <p className="text-2xl font-bold">{selectedOrder.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold">{formatINR(selectedOrder.totalAmount)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                  <p className="text-xs opacity-90">Order placed on {formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Payment Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-dark-brown mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium text-dark-brown">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    {selectedOrder.razorpayPaymentId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-mono text-xs text-dark-brown">{selectedOrder.razorpayPaymentId.slice(-10)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-dark-brown mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Delivery Address
                  </h3>
                  <div className="text-sm text-dark-brown">
                    <p className="font-medium">{selectedOrder.address?.name}</p>
                    <p className="text-gray-600">{selectedOrder.address?.phone}</p>
                    <p className="text-gray-600 mt-2">{selectedOrder.address?.addressLine}</p>
                    <p className="text-gray-600">
                      {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.zip}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-dark-brown mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-dark-brown truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">{formatINR(item.price)} × {item.quantity}</p>
                        
                        {/* Write Review Button */}
                        {(selectedOrder.status === 'Delivered' || selectedOrder.status === 'Shipped') && (
                          <button
                            onClick={() => handleWriteReview(item)}
                            className="mt-2 text-xs font-medium text-dark-brown hover:text-accent-red flex items-center gap-1 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Write Review
                          </button>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-dark-brown">{formatINR(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-dark-brown mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-dark-brown">
                      {formatINR(selectedOrder.totalAmount - (selectedOrder.shippingCost || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-dark-brown">
                      {selectedOrder.shippingCost === 0 ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        formatINR(selectedOrder.shippingCost)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300">
                    <span className="text-dark-brown">Total</span>
                    <span className="text-dark-brown">{formatINR(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <p className="text-xs text-gray-600">
                Need help? <a href="/support" className="text-dark-brown hover:text-accent-red font-medium">Contact Support</a>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Invoice
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-dark-brown text-white rounded-lg hover:bg-accent-red transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewingProduct && (
        <ReviewModal
          product={reviewingProduct}
          onClose={() => {
            setShowReviewModal(false);
            setReviewingProduct(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}

