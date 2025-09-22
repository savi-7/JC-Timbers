import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { useNotification } from '../components/NotificationProvider';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showSpecifications, setShowSpecifications] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Click outside handler for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/cart');
          const items = response.data.items || [];
          const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalItems);
        } catch (error) {
          setCartCount(0);
        }
      } else {
        // Check guest cart in localStorage
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          try {
            const cartData = JSON.parse(guestCart);
            const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
          } catch (error) {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }
      }
    };

    fetchCartCount();
  }, [isAuthenticated]);

  // Fetch wishlist count
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/wishlist');
          const items = response.data.items || [];
          setWishlistCount(items.length);
        } catch (error) {
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0);
      }
    };

    fetchWishlistCount();
  }, [isAuthenticated]);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching product with ID: ${id} (attempt ${retryCount + 1})`);
        const response = await api.get(`/products/${id}`);
        
        console.log('Product response:', response.data);
        
        if (response.data && response.data.product) {
          setProduct(response.data.product);
        } else {
          throw new Error('Invalid product data received');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        });
        
        // Retry logic for network errors
        if (retryCount < 2 && (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error'))) {
          console.log(`Retrying in 1 second... (attempt ${retryCount + 1})`);
          setTimeout(() => fetchProduct(retryCount + 1), 1000);
          return;
        }
        
        if (err.response?.status === 404) {
          setError('Product not found');
        } else if (err.response?.status === 500) {
          setError('Server error occurred. Please try again.');
        } else {
          setError('Failed to load product details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleLogout = () => {
    // This would need to be implemented based on your auth system
    navigate('/');
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // Store the product that user wants to add to cart
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product._id,
        productName: product.name,
        quantity: quantity,
        timestamp: Date.now()
      }));
      // Store the redirect destination
      localStorage.setItem('loginRedirect', '/cart');
      navigate("/login");
      return;
    }
    
    try {
      await api.post('/cart', { productId: product._id, quantity: quantity });
      showSuccess(`Added ${quantity} ${product.name} to cart`);
      // Refresh cart count
      const response = await api.get('/cart');
      const items = response.data.items || [];
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch (err) {
      console.error('Add to cart failed', err);
      const msg = err?.response?.data?.message || 'Failed to add to cart';
      showError(msg);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      // Store the product that user wants to add to wishlist
      localStorage.setItem('pendingWishlistItem', JSON.stringify({
        productId: product._id,
        productName: product.name,
        timestamp: Date.now()
      }));
      // Store the redirect destination
      localStorage.setItem('loginRedirect', '/wishlist');
      navigate("/login");
      return;
    }
    
    try {
      await api.post(`/wishlist/${product._id}`);
      showSuccess(`Added ${product.name} to wishlist`);
      // Refresh wishlist count
      const response = await api.get('/wishlist');
      const items = response.data.items || [];
      setWishlistCount(items.length);
    } catch (err) {
      console.error('Add to wishlist failed', err);
      const msg = err?.response?.data?.message || 'Failed to add to wishlist';
      showError(msg);
    }
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getImageUrl = (image) => {
    if (image.url) {
      return image.url;
    }
    if (image.data) {
      if (image.data.startsWith('data:')) {
        return image.data;
      }
      if (image.data.startsWith('http')) {
        return image.data;
      }
      return `data:${image.contentType || 'image/jpeg'};base64,${image.data}`;
    }
    return 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=No+Image';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Error</div>
          <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-dark-brown text-white px-4 py-2 rounded-lg hover:bg-accent-red transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation Header */}
      <nav className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left - Brand Name */}
            <div className="text-xl font-paragraph text-dark-brown tracking-wide">
              JC Timbers
            </div>
            
            {/* Center - Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph">
                Shop All
              </button>
              <button className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph">
                About
              </button>
              <button className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph">
                Contact
              </button>
            </div>
            
            {/* Right - Profile and Cart */}
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 text-dark-brown hover:text-accent-red transition-colors duration-200 p-2 rounded-lg hover:bg-cream"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-dark-brown to-accent-red rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block font-paragraph">{user?.name || 'User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-200">
                    {/* Profile Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-dark-brown">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-2">
                        Customer
                      </span>
                    </div>
                    
                    {/* Profile Options */}
                    <div className="py-1">
                      <button 
                        onClick={() => { navigate('/wishlist'); setShowProfileDropdown(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream transition-colors duration-150"
                      >
                        My Wishlist
                      </button>
                      <button 
                        onClick={() => { navigate('/cart'); setShowProfileDropdown(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream transition-colors duration-150"
                      >
                        My Cart
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={() => {
                          setShowProfileDropdown(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Wishlist Icon */}
              <button
                type="button"
                onClick={() => navigate('/wishlist')}
                className="relative cursor-pointer p-2 rounded-full hover:bg-cream focus:outline-none focus:ring-2 focus:ring-accent-red"
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
                {/* Wishlist Count Badge */}
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Icon */}
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="relative cursor-pointer p-2 rounded-full hover:bg-cream focus:outline-none focus:ring-2 focus:ring-accent-red"
                aria-label="Shopping Cart"
                title="Shopping Cart"
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
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {/* Cart Count Badge */}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Arrows */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <button className="hover:text-dark-brown transition-colors">
              ← Prev
            </button>
            <span>|</span>
            <button className="hover:text-dark-brown transition-colors">
              Next →
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Section - Product Image (60% width) */}
          <div className="lg:col-span-3">
            {/* Main Product Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm mb-4">
              <img
                src={getImageUrl(product.images[selectedImageIndex] || product.images[0])}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image';
                }}
              />
            </div>
            
            {/* Product Description */}
            <div className="text-left">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Right Section - Product Information (40% width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Title */}
            <h1 className="text-2xl font-bold text-dark-brown leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="text-xl font-bold text-dark-brown">
              {formatINR(product.price)}
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color *
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-brown">
                <option>Select</option>
                <option>Brown</option>
                <option>Natural</option>
                <option>Dark Brown</option>
              </select>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-dark-brown border-r border-gray-300"
                >
                  -
                </button>
                <span className="px-4 py-2 text-center min-w-[60px]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:text-dark-brown border-l border-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-dark-brown text-white py-3 px-6 rounded-md font-medium hover:bg-accent-red transition-colors duration-200"
            >
              Add to Cart
            </button>

            {/* Social Sharing Icons */}
            <div className="flex items-center space-x-4">
              <button className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-blue-700 transition-colors">
                f
              </button>
              <button className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-700 transition-colors">
                P
              </button>
              <button className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-green-700 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </button>
              <button className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-gray-700 transition-colors">
                X
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
