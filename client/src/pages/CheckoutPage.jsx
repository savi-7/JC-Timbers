import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import api from '../api/axios';
import { useNotification } from '../components/NotificationProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AddressSection from '../components/AddressSection';
import PaymentSection from '../components/PaymentSection';
import OrderSummarySection from '../components/OrderSummarySection';

// Razorpay Key - Configured with your credentials
const RAZORPAY_KEY_ID = 'rzp_test_RL7iTlLIMH8nZY';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { refreshCartCount } = useCart();
  const { showSuccess, showError } = useNotification();

  const [address, setAddress] = useState({
    name: '',
    phone: '',
    pincode: '',
    state: '',
    addressLine: '',
    flatHouseCompany: '',
    city: '',
    landmark: '',
    addressType: 'Home'
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    console.log('CheckoutPage - useEffect triggered, authLoading:', authLoading, 'isAuthenticated:', isAuthenticated);
    
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('CheckoutPage - Auth still loading, waiting...');
      return;
    }
    
    // Now check authentication
    if (!isAuthenticated) {
      console.log('CheckoutPage - Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    console.log('CheckoutPage - Authenticated, fetching cart...');
    fetchCart();
  }, [authLoading, isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      console.log('CheckoutPage - fetchCart started');
      setLoading(true);
      const response = await api.get('/cart');
      console.log('CheckoutPage - Cart response:', response.data);
      const items = response.data.items || [];
      console.log('CheckoutPage - Cart items count:', items.length);
      
      if (items.length === 0) {
        console.log('CheckoutPage - Cart is empty, redirecting to /cart');
        showError('Your cart is empty');
        navigate('/cart');
        return;
      }
      
      console.log('CheckoutPage - Setting cart items:', items);
      setCartItems(items);
      console.log('CheckoutPage - Cart items set successfully');
    } catch (error) {
      console.error('CheckoutPage - Error fetching cart:', error);
      showError('Failed to load cart items');
      navigate('/cart');
    } finally {
      setLoading(false);
      console.log('CheckoutPage - Loading set to false');
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.subtotal || (item.price * item.quantity)), 0);
  const shipping = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + shipping;

  // Check if address is complete
  const isAddressComplete = address.name && address.phone && address.pincode && address.state && 
                           address.addressLine && address.flatHouseCompany && address.city;

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Razorpay Payment
  const handleRazorpayPayment = async () => {
    try {
      setPlacing(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showError('Failed to load payment gateway. Please try again.');
        setPlacing(false);
        return;
      }

      // Create Razorpay order
      const orderResponse = await api.post('/payment/razorpay', {
        amount: total,
        address: {
          name: address.name,
          phone: address.phone,
          addressLine: address.addressLine,
          flatHouseCompany: address.flatHouseCompany,
          city: address.city,
          state: address.state,
          zip: address.pincode || address.zip,
          landmark: address.landmark,
          addressType: address.addressType
        }
      });

      const { orderId, amount, currency, keyId } = orderResponse.data;

      // Razorpay options
      const options = {
        key: keyId || RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'JC Timbers',
        description: 'Order Payment',
        image: '/logo.png', // Optional: Add your logo URL
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              address: {
                name: address.name,
                phone: address.phone,
                addressLine: address.addressLine,
                flatHouseCompany: address.flatHouseCompany,
                city: address.city,
                state: address.state,
                zip: address.pincode || address.zip,
                landmark: address.landmark,
                addressType: address.addressType
              }
            });

            if (verifyResponse.data.success) {
              showSuccess('Payment successful! Your order has been placed.');
              refreshCartCount();
              navigate('/order-success', { 
                state: { 
                  orderId: verifyResponse.data.order._id,
                  totalAmount: verifyResponse.data.order.totalAmount
                } 
              });
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            showError(error.response?.data?.message || 'Payment verification failed');
            setPlacing(false);
          }
        },
        prefill: {
          name: address.name,
          contact: address.phone,
          email: 'customer@example.com' // Optional but recommended
        },
        notes: {
          address: `${address.flatHouseCompany}, ${address.addressLine}, ${address.city}, ${address.state} - ${address.pincode || address.zip}`
        },
        theme: {
          color: '#5A3E36'
        },
        modal: {
          ondismiss: function() {
            setPlacing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      showError(error.response?.data?.message || 'Failed to initiate payment');
      setPlacing(false);
    }
  };

  // Handle COD Order
  const handleCODOrder = async () => {
    try {
      setPlacing(true);

      const response = await api.post('/payment/cod', {
        address: {
          name: address.name,
          phone: address.phone,
          addressLine: address.addressLine,
          flatHouseCompany: address.flatHouseCompany,
          city: address.city,
          state: address.state,
          zip: address.pincode || address.zip,
          landmark: address.landmark,
          addressType: address.addressType
        }
      });

      if (response.data.success) {
        showSuccess('Order placed successfully!');
        refreshCartCount();
        navigate('/order-success', { 
          state: { 
            orderId: response.data.order._id,
            totalAmount: response.data.order.totalAmount
          } 
        });
      }
    } catch (error) {
      console.error('COD order error:', error);
      showError(error.response?.data?.message || 'Failed to place order');
      setPlacing(false);
    }
  };

  // Handle Place Order
  const handlePlaceOrder = () => {
    if (!isAddressComplete) {
      showError('Please complete your delivery address');
      return;
    }

    if (!paymentMethod) {
      showError('Please select a payment method');
      return;
    }

    if (cartItems.length === 0) {
      showError('Your cart is empty');
      return;
    }

    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else if (paymentMethod === 'cod') {
      handleCODOrder();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-brown">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order in just a few steps</p>
        </div>

        {/* Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address */}
            <AddressSection 
              address={address} 
              setAddress={setAddress}
              onComplete={() => {
                // Address saved successfully
              }}
            />

            {/* Step 2: Payment Method */}
            <PaymentSection 
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              disabled={!isAddressComplete}
            />
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummarySection 
              cartItems={cartItems}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
              disabled={!isAddressComplete || !paymentMethod}
              onPlaceOrder={handlePlaceOrder}
              loading={placing}
            />
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900">Secure Checkout</h4>
              <p className="text-sm text-blue-800 mt-1">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

