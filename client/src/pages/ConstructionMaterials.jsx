import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useNotification } from '../components/NotificationProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function ConstructionMaterials() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { refreshCartCount } = useCart();
  const { showSuccess, showError } = useNotification();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleLogout = () => {
    logout();
    // Navigation is handled by the logout function in useAuth hook
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      // Store the product that user wants to add to cart
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product._id,
        productName: product.name,
        quantity: 1,
        timestamp: Date.now()
      }));
      // Store the redirect destination
      localStorage.setItem('loginRedirect', '/cart');
      navigate("/login");
      return;
    }

    (async () => {
      try {
        await api.post('/cart', { productId: product._id, quantity: 1 });
        showSuccess('Added to cart');
        // Refresh cart count in header
        refreshCartCount();
      } catch (err) {
        console.error('Add to cart failed', err);
        const msg = err?.response?.data?.message || 'Failed to add to cart';
        showError(msg);
      }
    })();
  };

  const handleBuyNow = (product) => {
    if (!isAuthenticated) {
      // Store the product that user wants to buy
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product._id,
        productName: product.name,
        quantity: 1,
        timestamp: Date.now()
      }));
      // Store the redirect destination as checkout
      localStorage.setItem('loginRedirect', '/checkout');
      navigate("/login");
      return;
    }

    (async () => {
      try {
        await api.post('/cart', { productId: product._id, quantity: 1 });
        // Refresh cart count in header
        refreshCartCount();
        // Immediately redirect to checkout
        navigate('/checkout');
      } catch (err) {
        console.error('Buy now failed', err);
        const msg = err?.response?.data?.message || 'Failed to process order';
        showError(msg);
      }
    })();
  };

  // Fetch construction materials from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products?limit=100');
        const allProducts = response.data.products || [];
        // Filter only construction materials
        const constructionProducts = allProducts.filter(product => product.category === 'construction');
        setProducts(constructionProducts);
        setFilteredProducts(constructionProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load construction materials. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'material':
          aValue = a.material?.toLowerCase() || '';
          bValue = b.material?.toLowerCase() || '';
          break;
        case 'brand':
          aValue = a.brand?.toLowerCase() || '';
          bValue = b.brand?.toLowerCase() || '';
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy, sortOrder]);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  // Error component
  const ErrorMessage = ({ message }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <svg className="h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Products</h3>
      <p className="text-red-600">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-4">
        {/* Immersive Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-dark-brown text-cream py-16 lg:py-24 rounded-3xl mb-12 relative overflow-hidden shadow-2xl flex items-center justify-center text-center isolate"
        >
          {/* Static background blobs optimized for performance */}
          <div
            className="absolute -top-[50%] -right-[10%] w-[80%] h-[150%] rounded-full bg-accent-red blur-[100px] opacity-20 pointer-events-none -z-10"
          />
          <div
            className="absolute -bottom-[50%] -left-[10%] w-[80%] h-[150%] rounded-[40%] bg-cream blur-[100px] opacity-10 pointer-events-none -z-10"
          />

          <div className="relative z-10 px-6 max-w-4xl mx-auto">
            <motion.h1
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl lg:text-7xl font-heading font-bold text-white leading-[1.1] mb-6 tracking-tight"
            >
              Construction Materials
            </motion.h1>
            <motion.p
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg lg:text-xl text-cream/80 font-paragraph leading-relaxed max-w-2xl mx-auto mb-3"
            >
              High-quality building materials for all your construction needs.
              From secure foundations to robust finishing touches, we've got you covered.
            </motion.p>
          </div>
        </motion.div>

        {/* Floating Search and Filter Section */}
        {!loading && !error && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="sticky top-[80px] z-40 bg-white/80 backdrop-blur-xl shadow-lg border border-white/50 p-4 mb-12 rounded-2xl"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="w-full lg:flex-1">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search construction materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200 bg-white text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="material">Sort by Material</option>
                  <option value="brand">Sort by Brand</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-1 text-sm"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                  {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                </button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
                {searchTerm && (
                  <span className="ml-2">
                    for "<span className="font-medium text-dark-brown">{searchTerm}</span>"
                  </span>
                )}
              </p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mt-2"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="aspect-square w-full bg-gray-200 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-full"></div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2"></div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        {/* Products Section */}
        {!loading && !error && (
          <>
            {filteredProducts.length > 0 ? (
              <div className="space-y-8">
                {/* Products Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Construction Materials</h2>
                    <p className="text-gray-600 mt-1">Browse {filteredProducts.length} durable construction materials</p>
                  </div>
                </div>

                {/* Products Grid */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12"
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                    />
                  ))}
                </div>
              </div>
            ) : products.length > 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">No construction materials match your search criteria. Try adjusting your search terms or filters.</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="inline-flex items-center gap-2 bg-dark-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-red transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Search
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Construction Materials Available</h3>
                  <p className="text-gray-500 mb-6">We're sourcing quality construction materials. Check back soon!</p>
                  <button
                    onClick={() => navigate('/customer-home')}
                    className="inline-flex items-center gap-2 bg-dark-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-red transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </main>
      <Footer />
    </div>
  );
}
