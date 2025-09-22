import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';

export default function Cart() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuestCart, setIsGuestCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        // Fetch from server for authenticated users
        const res = await api.get('/cart');
        setItems(res.data.items || []);
        setTotal(res.data.total || 0);
        setIsGuestCart(false);
      } else {
        // Load from localStorage for guest users
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const cartData = JSON.parse(guestCart);
          setItems(cartData.items || []);
          setTotal(cartData.total || 0);
        } else {
          setItems([]);
          setTotal(0);
        }
        setIsGuestCart(true);
      }
      
      setError(null);
    } catch (e) {
      console.error('Cart fetch error:', e);
      
      // Only fall back to guest cart if user is NOT authenticated
      if (!isAuthenticated) {
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const cartData = JSON.parse(guestCart);
          setItems(cartData.items || []);
          setTotal(cartData.total || 0);
        } else {
          setItems([]);
          setTotal(0);
        }
        setIsGuestCart(true);
      } else {
        // For authenticated users, show empty cart if API fails
        setItems([]);
        setTotal(0);
        setIsGuestCart(false);
        setError('Failed to load cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    console.log('Cart component - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);
    
    // Wait for authentication to load before fetching cart
    if (!authLoading) {
      fetchCart(); 
    }
    
    // Check for pending cart item from login flow
    const pendingCartItem = localStorage.getItem('pendingCartItem');
    if (pendingCartItem) {
      try {
        const item = JSON.parse(pendingCartItem);
        // Check if item is recent (within 5 minutes)
        if (Date.now() - item.timestamp < 5 * 60 * 1000) {
          addPendingItemToCart(item);
        } else {
          // Remove expired pending item
          localStorage.removeItem('pendingCartItem');
        }
      } catch (error) {
        console.error('Error parsing pending cart item:', error);
        localStorage.removeItem('pendingCartItem');
      }
    }
  }, [authLoading, isAuthenticated]);

  const addPendingItemToCart = async (item) => {
    try {
      await api.post('/cart', { productId: item.productId, quantity: item.quantity });
      // Remove the pending item
      localStorage.removeItem('pendingCartItem');
      // Refresh cart to show the new item
      fetchCart();
      // Show success message
      showSuccess(`${item.productName} has been added to your cart!`);
    } catch (error) {
      console.error('Error adding pending item to cart:', error);
      showError('Failed to add item to cart. Please try again.');
    }
  };

  const updateQty = async (productId, qty) => {
    if (qty < 1) return;
    
    if (isAuthenticated) {
      try {
        await api.patch('/cart', { productId, quantity: qty });
        fetchCart();
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to update quantity');
      }
    } else {
      // Update guest cart in localStorage
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        const cartData = JSON.parse(guestCart);
        const itemIndex = cartData.items.findIndex(item => item.productId === productId);
        if (itemIndex !== -1) {
          cartData.items[itemIndex].quantity = qty;
          cartData.items[itemIndex].subtotal = cartData.items[itemIndex].price * qty;
          cartData.total = cartData.items.reduce((sum, item) => sum + item.subtotal, 0);
          localStorage.setItem('guestCart', JSON.stringify(cartData));
          fetchCart();
        }
      }
    }
  };

  const removeItem = async (productId) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/cart/${productId}`);
        fetchCart();
        showSuccess('Item removed from cart');
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to remove item');
      }
    } else {
      // Remove from guest cart in localStorage
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        const cartData = JSON.parse(guestCart);
        cartData.items = cartData.items.filter(item => item.productId !== productId);
        cartData.total = cartData.items.reduce((sum, item) => sum + item.subtotal, 0);
        localStorage.setItem('guestCart', JSON.stringify(cartData));
        fetchCart();
        showSuccess('Item removed from cart');
      }
    }
  };

  const handleViewDetails = (item) => {
    setSelectedProduct(item);
    setShowProductDetails(true);
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProductImage = (item) => {
    if (item && item.image) {
      if (item.image.startsWith('/uploads/')) {
        return `http://localhost:5001${item.image}`;
      }
      if (item.image.startsWith('http') || item.image.startsWith('data:')) {
        return item.image;
      }
      return item.image;
    }
    return 'https://via.placeholder.com/120/f3f4f6/9ca3af?text=No+Image';
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation Header */}
      <nav className="bg-cream border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left - Brand Name */}
            <div className="text-xl font-paragraph text-dark-brown tracking-wide">
              JC Timbers
            </div>
            
            {/* Center - Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/customer-home')}
                className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
              >
                Home
              </button>
              <button 
                onClick={() => navigate('/timber-products')}
                className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
              >
                Timber Products
              </button>
              <button 
                onClick={() => navigate('/furniture')}
                className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
              >
                Furniture
              </button>
              <button 
                onClick={() => navigate('/construction-materials')}
                className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
              >
                Construction Materials
              </button>
            </div>
            
            {/* Right - Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/wishlist')}
                className="relative cursor-pointer p-2 rounded-full hover:bg-light-cream focus:outline-none focus:ring-2 focus:ring-accent-red"
                aria-label="Wishlist"
                title="Wishlist"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-6 h-6 text-dark-brown hover:text-accent-red transition-colors duration-200"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              
              <button
                onClick={() => navigate('/customer-home')}
                className="bg-dark-brown hover:bg-accent-red text-white px-4 py-2 rounded-lg font-paragraph transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {authLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown mx-auto"></div>
            <p className="mt-4 text-dark-brown font-paragraph">Loading authentication...</p>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-heading text-dark-brown mb-2">Your Shopping Cart</h1>
                <p className="text-gray-600 font-paragraph">Review your items and proceed to checkout</p>
              </div>
              {isGuestCart && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 font-paragraph">
                    You're shopping as a guest. 
                    <button 
                      onClick={() => navigate('/login')} 
                      className="ml-1 text-accent-red hover:text-red-700 underline font-medium"
                    >
                      Sign in
                    </button> 
                    {' '}to save your cart and checkout.
                  </p>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown mx-auto"></div>
                <p className="mt-4 text-dark-brown font-paragraph">Loading your cart...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Cart</h3>
                <p className="text-red-600 font-paragraph">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-accent-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center bg-white p-12 rounded-2xl shadow-lg">
                <div className="flex justify-center mb-6">
                  <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading text-dark-brown mb-4">Your Cart is Empty</h3>
                <p className="text-gray-600 font-paragraph mb-6">Looks like you haven't added any items to your cart yet.</p>
                <button 
                  onClick={() => navigate('/customer-home')} 
                  className="bg-dark-brown hover:bg-accent-red text-white px-6 py-3 rounded-lg font-paragraph transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map(item => (
                    <div key={item.productId} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start gap-6">
                        {/* Product Thumbnail */}
                        <div className="flex-shrink-0">
                          <img 
                            src={getProductImage(item)} 
                            alt={item.name} 
                            className="w-24 h-24 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/120/f3f4f6/9ca3af?text=No+Image';
                            }}
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-heading text-dark-brown mb-1">{item.name}</h3>
                              <p className="text-sm text-gray-600 font-paragraph">Price per unit: {formatINR(item.price)}</p>
                              <p className="text-xs text-gray-500 font-paragraph">Available: {item.available} units</p>
                            </div>
                            <button
                              onClick={() => handleViewDetails(item)}
                              className="text-accent-red hover:text-red-700 text-sm font-medium underline"
                            >
                              View Details
                            </button>
                          </div>
                          
                          {/* Quantity Management */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-700">Quantity:</span>
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button 
                                  onClick={() => updateQty(item.productId, item.quantity - 1)} 
                                  className="px-3 py-2 text-dark-brown hover:bg-light-cream transition-colors duration-200 rounded-l-lg"
                                  disabled={item.quantity <= 1}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="px-4 py-2 text-center font-medium min-w-[3rem]">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQty(item.productId, item.quantity + 1)} 
                                  className="px-3 py-2 text-dark-brown hover:bg-light-cream transition-colors duration-200 rounded-r-lg"
                                  disabled={item.quantity >= item.available}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-heading text-dark-brown">{formatINR(item.subtotal)}</div>
                              <button 
                                onClick={() => removeItem(item.productId)} 
                                className="text-sm text-red-600 hover:text-red-700 font-medium underline mt-1"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                    <h3 className="text-xl font-heading text-dark-brown mb-6">Order Summary</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span className="font-paragraph">Subtotal ({items.length} items)</span>
                        <span className="font-medium">{formatINR(total)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span className="font-paragraph">Shipping</span>
                        <span className="font-medium">Free</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span className="font-paragraph">Tax</span>
                        <span className="font-medium">Included</span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between text-lg font-heading text-dark-brown">
                        <span>Total</span>
                        <span>{formatINR(total)}</span>
                      </div>
                    </div>
                    
                    <button 
                      className="w-full bg-dark-brown hover:bg-accent-red text-white py-3 rounded-lg font-paragraph transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mb-4"
                    >
                      Proceed to Checkout
                    </button>
                    
                    <button 
                      onClick={() => navigate('/customer-home')}
                      className="w-full border-2 border-dark-brown text-dark-brown hover:bg-dark-brown hover:text-white py-3 rounded-lg font-paragraph transition-colors duration-200"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Product Details Modal */}
      {showProductDetails && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-heading text-dark-brown">Product Details</h2>
                <button
                  onClick={() => setShowProductDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={getProductImage(selectedProduct)} 
                    alt={selectedProduct.name} 
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400/f3f4f6/9ca3af?text=No+Image';
                    }}
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-heading text-dark-brown mb-4">{selectedProduct.name}</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Price per unit:</span>
                      <span className="font-heading text-dark-brown">{formatINR(selectedProduct.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Quantity in cart:</span>
                      <span className="font-medium text-dark-brown">{selectedProduct.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Subtotal:</span>
                      <span className="font-heading text-dark-brown">{formatINR(selectedProduct.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Available stock:</span>
                      <span className="font-medium text-gray-600">{selectedProduct.available} units</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowProductDetails(false)}
                      className="flex-1 bg-dark-brown hover:bg-accent-red text-white py-2 px-4 rounded-lg font-paragraph transition-colors duration-200"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowProductDetails(false);
                        navigate(`/product/${selectedProduct.productId}`);
                      }}
                      className="flex-1 border-2 border-dark-brown text-dark-brown hover:bg-dark-brown hover:text-white py-2 px-4 rounded-lg font-paragraph transition-colors duration-200"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}










