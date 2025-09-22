import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';
import { API_BASE } from '../config';

const getProductImage = (item) => {
  // Handle the wishlist item structure from backend
  if (item && item.image) {
    // If image is a URL path, construct full URL
    if (item.image.startsWith('/uploads/')) {
      return `${API_BASE.replace('/api', '')}${item.image}`;
    }
    // If it's already a full URL, return as is
    if (item.image.startsWith('http')) {
      return item.image;
    }
    // If it's a data URL, return as is
    if (item.image.startsWith('data:')) {
      return item.image;
    }
    return item.image;
  }
  
  // Fallback to placeholder
  return 'https://via.placeholder.com/120/f3f4f6/9ca3af?text=No+Image';
};

export default function Wishlist() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [addedToCartItems, setAddedToCartItems] = useState(new Set());
  
  // Filter and sort states
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      const wishlistItems = res.data.items || [];
      setItems(wishlistItems);
      
      // Initialize quantities for each item
      const initialQuantities = {};
      wishlistItems.forEach(item => {
        initialQuantities[item.productId] = 1;
      });
      setQuantities(initialQuantities);
      
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (isAuthenticated) {
      fetchWishlist();
      
      // Check for pending wishlist item from login flow
      const pendingWishlistItem = localStorage.getItem('pendingWishlistItem');
      if (pendingWishlistItem) {
        try {
          const item = JSON.parse(pendingWishlistItem);
          // Check if item is recent (within 5 minutes)
          if (Date.now() - item.timestamp < 5 * 60 * 1000) {
            addPendingItemToWishlist(item);
          } else {
            // Remove expired pending item
            localStorage.removeItem('pendingWishlistItem');
          }
        } catch (error) {
          console.error('Error parsing pending wishlist item:', error);
          localStorage.removeItem('pendingWishlistItem');
        }
      }
    } else {
      setLoading(false);
      setError('Please log in to view your wishlist');
    }
  }, [isAuthenticated]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...items];

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Apply price range filter
    if (priceRange !== 'all') {
      switch (priceRange) {
        case 'under-1000':
          filtered = filtered.filter(item => item.price < 1000);
          break;
        case '1000-5000':
          filtered = filtered.filter(item => item.price >= 1000 && item.price <= 5000);
          break;
        case 'over-5000':
          filtered = filtered.filter(item => item.price > 5000);
          break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        // Keep original order (newest first)
        break;
    }

    setFilteredItems(filtered);
  }, [items, sortBy, filterCategory, priceRange]);

  const addPendingItemToWishlist = async (item) => {
    try {
      await api.post(`/wishlist/${item.productId}`);
      // Remove the pending item
      localStorage.removeItem('pendingWishlistItem');
      // Refresh wishlist to show the new item
      fetchWishlist();
      // Show success message
      showSuccess('Item has been added to your wishlist!');
    } catch (error) {
      console.error('Error adding pending item to wishlist:', error);
      showError('Failed to add item to wishlist. Please try again.');
      // Remove the pending item even if it failed
      localStorage.removeItem('pendingWishlistItem');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      fetchWishlist();
      showSuccess('Removed from wishlist');
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to remove from wishlist');
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      await api.post('/cart', { productId: product.productId, quantity });
      showSuccess(`${product.name} (${quantity} ${quantity > 1 ? 'items' : 'item'}) added to cart!`);
      
      // Mark this item as added to cart
      setAddedToCartItems(prev => new Set([...prev, product.productId]));
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
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

  const getCategories = () => {
    const categories = [...new Set(items.map(item => item.category))];
    return categories.filter(cat => cat && cat !== 'undefined');
  };

  const getAvailabilityStatus = (item) => {
    // Always show "In Stock" for all products
    return { status: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-50' };
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
                type="button"
                onClick={() => navigate('/cart')}
                className="relative cursor-pointer p-2 rounded-full hover:bg-light-cream focus:outline-none focus:ring-2 focus:ring-accent-red"
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
                <h1 className="text-3xl font-heading text-dark-brown mb-2">My Wishlist</h1>
                <p className="text-gray-600 font-paragraph">Save your favorite items for later</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 font-paragraph">Total Items</div>
                <div className="text-2xl font-heading text-dark-brown">{filteredItems.length}</div>
              </div>
            </div>
      
      {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown mx-auto"></div>
                <p className="mt-4 text-dark-brown font-paragraph">Loading your wishlist...</p>
              </div>
      ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Wishlist</h3>
                <p className="text-red-600 font-paragraph">{error}</p>
          {!isAuthenticated && (
            <button 
              onClick={() => navigate('/login')}
                    className="mt-4 bg-accent-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Sign In
            </button>
          )}
        </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center bg-white p-12 rounded-2xl shadow-lg">
                <div className="flex justify-center mb-6">
                  <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading text-dark-brown mb-4">Your Wishlist is Empty</h3>
                <p className="text-gray-600 font-paragraph mb-6">
                  {items.length === 0 
                    ? "Looks like you haven't added any items to your wishlist yet."
                    : "No items match your current filters. Try adjusting your search criteria."
                  }
                </p>
                <button 
                  onClick={() => navigate('/customer-home')} 
                  className="bg-dark-brown hover:bg-accent-red text-white px-6 py-3 rounded-lg font-paragraph transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Shopping
                </button>
        </div>
      ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters and Sort Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                    <h3 className="text-lg font-heading text-dark-brown mb-6">Filter & Sort</h3>
                    
                    {/* Sort Options */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Sort By</h4>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-accent-red"
                      >
                        <option value="newest">Newest Added</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name: A to Z</option>
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-accent-red"
                      >
                        <option value="all">All Categories</option>
                        {getCategories().map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
                      <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-accent-red"
                      >
                        <option value="all">All Prices</option>
                        <option value="under-1000">Under ₹1,000</option>
                        <option value="1000-5000">₹1,000 - ₹5,000</option>
                        <option value="over-5000">Over ₹5,000</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    <button
                      onClick={() => {
                        setSortBy('newest');
                        setFilterCategory('all');
                        setPriceRange('all');
                      }}
                      className="w-full text-sm text-accent-red hover:text-red-700 font-medium underline"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>

                {/* Wishlist Items */}
                <div className="lg:col-span-3 space-y-4">
                  {filteredItems.map(item => {
                    const availability = getAvailabilityStatus(item);
                    const quantity = quantities[item.productId] || 1;
                    
                    return (
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
                                <p className="text-sm text-gray-600 font-paragraph">Category: {item.category}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${availability.bgColor} ${availability.color}`}>
                                    {availability.status}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleViewDetails(item)}
                                className="text-accent-red hover:text-red-700 text-sm font-medium underline"
                              >
                                View Details
                              </button>
                            </div>
                            
                            {/* Price and Quantity Management */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="text-lg font-heading text-dark-brown">{formatINR(item.price)}</div>
                                
                                {/* Quantity Selection */}
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-700">Qty:</span>
                                  <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button 
                                      onClick={() => updateQuantity(item.productId, quantity - 1)} 
                                      className="px-3 py-2 text-dark-brown hover:bg-light-cream transition-colors duration-200 rounded-l-lg"
                                      disabled={quantity <= 1}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                      </svg>
                                    </button>
                                    <span className="px-4 py-2 text-center font-medium min-w-[3rem]">{quantity}</span>
                                    <button 
                                      onClick={() => updateQuantity(item.productId, quantity + 1)} 
                                      className="px-3 py-2 text-dark-brown hover:bg-light-cream transition-colors duration-200 rounded-r-lg"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                      </svg>
                                    </button>
                                  </div>
                </div>
              </div>
                              
                              <div className="flex items-center space-x-2">
                                {addedToCartItems.has(item.productId) ? (
                                  <>
                                    <button
                                      onClick={() => navigate('/cart')}
                                      className="bg-accent-red hover:bg-red-700 text-white px-4 py-2 rounded-lg font-paragraph transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                      View Cart
                                    </button>
                                    <button
                                      onClick={() => addToCart(item, quantity)}
                                      className="bg-dark-brown hover:bg-accent-red text-white px-4 py-2 rounded-lg font-paragraph transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                      Add More ({quantity})
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    onClick={() => addToCart(item, quantity)}
                                    className="bg-dark-brown hover:bg-accent-red text-white px-4 py-2 rounded-lg font-paragraph transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                  >
                                    Add to Cart ({quantity})
                                  </button>
                                )}
                                <button 
                                  onClick={() => removeFromWishlist(item.productId)}
                                  className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                                >
                                  Remove
                                </button>
                              </div>
            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                      <span className="font-medium text-gray-700">Price:</span>
                      <span className="font-heading text-dark-brown">{formatINR(selectedProduct.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Category:</span>
                      <span className="font-medium text-gray-600">{selectedProduct.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Subcategory:</span>
                      <span className="font-medium text-gray-600">{selectedProduct.subcategory || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Availability:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityStatus(selectedProduct).bgColor} ${getAvailabilityStatus(selectedProduct).color}`}>
                        {getAvailabilityStatus(selectedProduct).status}
                      </span>
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
