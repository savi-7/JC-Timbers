import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { generateInvoice } from '../utils/invoiceGenerator';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const orderData = location.state;
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch full order details
    const fetchOrderDetails = async () => {
      if (!orderData || !orderData.orderId) {
        console.log('OrderSuccess - No order data, redirecting...');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        console.log('OrderSuccess - Fetching order details for:', orderData.orderId);
        const response = await api.get(`/orders/me`);
        const orders = response.data || [];
        console.log('OrderSuccess - Found orders:', orders.length);
        console.log('OrderSuccess - API Response:', response.data);
        
        const order = orders.find(o => o._id === orderData.orderId);
        
        if (order) {
          console.log('OrderSuccess - Order found:', order._id);
          console.log('OrderSuccess - Full Order Object:', order);
          console.log('OrderSuccess - Order items array:', order.items);
          
          order.items?.forEach((item, index) => {
            console.log(`\n=== OrderSuccess - Item ${index} Details ===`);
            console.log('  Name:', item.name);
            console.log('  Has image?:', !!item.image);
            console.log('  Image type:', typeof item.image);
            console.log('  Image value:', item.image);
            
            if (item.image) {
              console.log('  Image length:', item.image.length);
              console.log('  Image starts with "data:"?', item.image.startsWith('data:'));
              console.log('  First 100 chars:', item.image.substring(0, 100));
              
              if (item.image.startsWith('data:')) {
                const parts = item.image.split(',');
                console.log('  Data URL header:', parts[0]);
                console.log('  Base64 data length:', parts[1]?.length || 0);
              }
            } else {
              console.log('  ❌ NO IMAGE DATA!');
            }
            console.log('=====================================\n');
          });
          
          setOrderDetails(order);
        } else {
          console.log('OrderSuccess - Order not found in list');
          console.log('OrderSuccess - Looking for ID:', orderData.orderId);
          console.log('OrderSuccess - Available IDs:', orders.map(o => o._id));
        }
      } catch (error) {
        console.error('OrderSuccess - Error fetching order details:', error);
        console.error('OrderSuccess - Error response:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderData, navigate]);

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
      minute: '2-digit',
      hour12: true
    });
  };

  const getExpectedDeliveryDate = (orderDate) => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 5); // Add 5 days for delivery
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDownloadInvoice = () => {
    if (!orderDetails) {
      alert('Order details not available. Please refresh the page.');
      return;
    }
    
    try {
      console.log('OrderSuccess - Generating invoice for order:', orderDetails._id);
      generateInvoice(orderDetails);
      console.log('OrderSuccess - Invoice generated successfully');
    } catch (error) {
      console.error('OrderSuccess - Error generating invoice:', error);
      alert(`Failed to generate invoice: ${error.message}\n\nPlease check the console for details.`);
    }
  };

  const getImageUrl = (image) => {
    if (!image) {
      console.log('OrderSuccess - No image provided');
      return null;
    }
    
    const imagePreview = image.length > 100 ? image.substring(0, 100) + `... (${image.length} chars total)` : image;
    console.log('OrderSuccess - Processing image:', imagePreview);
    
    // Base64 data URL
    if (image.startsWith('data:')) {
      console.log('OrderSuccess - ✓ Using base64 data URL (length:', image.length, ')');
      return image;
    }
    
    // Full URL
    if (image.startsWith('http')) {
      console.log('OrderSuccess - ✓ Using HTTP URL');
      return image;
    }
    
    // Upload path
    if (image.startsWith('/uploads/')) {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${image}`;
      console.log('OrderSuccess - ✓ Using uploads path:', url);
      return url;
    }
    
    // Default: assume it's a filename
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/uploads/${image}`;
    console.log('OrderSuccess - ✓ Using default filename path:', url);
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dark-brown mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />

      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl px-6 py-8 text-center shadow-xl mb-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Thank you, {user?.name || orderDetails?.user?.name || 'Customer'}!
            </h1>
            <p className="text-green-100 text-lg">Your order has been placed successfully.</p>
          </div>

          {orderDetails ? (
            <div className="space-y-6">
              {/* Order Info Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Number */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="text-2xl font-bold text-dark-brown font-mono">
                      #{orderDetails._id.toUpperCase().slice(-12)}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Placed On</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatDate(orderDetails.createdAt)}
                    </p>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                        orderDetails.paymentStatus === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {orderDetails.paymentStatus}
                      </span>
                      <span className="text-sm text-gray-600">
                        via {orderDetails.paymentMethod === 'Online' ? 'Razorpay' : 'Cash on Delivery'}
                      </span>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Status</p>
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      {orderDetails.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-dark-brown mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Delivery & Shipping Details
                </h2>

                <div className="space-y-4">
                  {/* Delivery Address */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Delivery Address</p>
                    <div className="text-gray-800">
                      <p className="font-semibold">{orderDetails.address?.name}</p>
                      <p>{orderDetails.address?.addressLine}</p>
                      <p>{orderDetails.address?.city}, {orderDetails.address?.state} - {orderDetails.address?.zip}</p>
                      <p className="mt-1">Phone: {orderDetails.address?.phone}</p>
                    </div>
                  </div>

                  {/* Expected Delivery */}
                  <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-600">Expected Delivery</p>
                        <p className="font-semibold text-gray-800">
                          {getExpectedDeliveryDate(orderDetails.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Estimated</p>
                      <p className="text-sm font-semibold text-blue-600">3-5 Business Days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-dark-brown mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order Items
                </h2>

                <div className="space-y-4">
                  {orderDetails.items?.map((item, index) => {
                    const imageUrl = getImageUrl(item.image);
                    console.log(`OrderSuccess - Item ${index} (${item.name}):`, {
                      hasRawImage: !!item.image,
                      imageType: item.image ? typeof item.image : 'undefined',
                      imageStart: item.image ? item.image.substring(0, 50) : 'N/A',
                      imageLength: item.image ? item.image.length : 0,
                      processedUrl: imageUrl ? imageUrl.substring(0, 100) : 'NULL'
                    });
                    
                    return (
                      <div key={index} className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                              onLoad={() => {
                                console.log(`✓ OrderSuccess - Image loaded successfully for: ${item.name}`);
                              }}
                              onError={(e) => {
                                console.error(`✗ OrderSuccess - Image load FAILED for: ${item.name}`);
                                console.error('  - Image URL start:', imageUrl.substring(0, 100));
                                console.error('  - Image URL length:', imageUrl.length);
                                console.error('  - Error event:', e.type);
                                
                                // Try to validate base64
                                if (imageUrl.startsWith('data:')) {
                                  const parts = imageUrl.split(',');
                                  console.error('  - Data URL parts:', parts.length);
                                  console.error('  - Header:', parts[0]);
                                  console.error('  - Base64 data length:', parts[1]?.length || 0);
                                  console.error('  - First 50 chars of base64:', parts[1]?.substring(0, 50) || 'EMPTY');
                                }
                                
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                `;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Price: {formatINR(item.price)} each</p>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Subtotal</p>
                          <p className="font-bold text-dark-brown">{formatINR(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-dark-brown mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Details
                </h2>

                <div className="space-y-4">
                  {/* Payment Method */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Payment Method</span>
                    <span className="font-semibold text-gray-900">
                      {orderDetails.paymentMethod === 'Online' ? 'Razorpay (Online Payment)' : 'Cash on Delivery'}
                    </span>
                  </div>

                  {/* Payment ID (if online) */}
                  {orderDetails.razorpayPaymentId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Payment ID</span>
                      <span className="font-mono text-sm text-gray-900">{orderDetails.razorpayPaymentId}</span>
                    </div>
                  )}

                  {/* Transaction Status */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Transaction Status</span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                      orderDetails.paymentStatus === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {orderDetails.paymentStatus === 'Paid' ? 'Success' : 'Pending'}
                    </span>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>{formatINR(orderDetails.totalAmount - (orderDetails.shippingCost || 0))}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping Cost</span>
                      <span>{orderDetails.shippingCost > 0 ? formatINR(orderDetails.shippingCost) : 'FREE'}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-dark-brown pt-2 border-t border-gray-200">
                      <span>Total Amount</span>
                      <span>{formatINR(orderDetails.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <button
                  onClick={handleDownloadInvoice}
                  className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Invoice
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full py-3 px-6 bg-dark-brown text-white rounded-lg font-semibold hover:bg-accent-red transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  View Order History
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 px-6 border-2 border-dark-brown text-dark-brown rounded-lg font-semibold hover:bg-dark-brown hover:text-white transition-colors duration-200"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Contact Support */}
              <div className="text-center pt-4">
                <p className="text-gray-600">
                  Need help with your order?{' '}
                  <button
                    onClick={() => navigate('/contact')}
                    className="text-dark-brown font-semibold hover:text-accent-red transition-colors underline"
                  >
                    Contact Support
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-yellow-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">We couldn't load your order details. Please try again.</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-dark-brown text-white rounded-lg font-semibold hover:bg-accent-red transition-colors"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

