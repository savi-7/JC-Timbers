import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import api from '../api/axios';
import { useNotification } from '../components/NotificationProvider';
import Header from '../components/Header';
import SimilarProducts from '../components/SimilarProducts';
import ProductReviews from '../components/ProductReviews';
import ReviewModal from '../components/ReviewModal';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCart();
  const { showSuccess, showError } = useNotification();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showSpecifications, setShowSpecifications] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

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
      // Refresh cart count in header
      refreshCartCount();
    } catch (err) {
      console.error('Add to cart failed', err);
      const msg = err?.response?.data?.message || 'Failed to add to cart';
      showError(msg);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      // Store the product that user wants to buy
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product._id,
        productName: product.name,
        quantity: quantity,
        timestamp: Date.now()
      }));
      // Store the redirect destination as checkout
      localStorage.setItem('loginRedirect', '/checkout');
      navigate("/login");
      return;
    }
    
    try {
      await api.post('/cart', { productId: product._id, quantity: quantity });
      // Refresh cart count in header
      refreshCartCount();
      // Immediately redirect to checkout
      navigate('/checkout');
    } catch (err) {
      console.error('Buy now failed', err);
      const msg = err?.response?.data?.message || 'Failed to process order';
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
    const fallback = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=No+Image';
    if (!image) {
      return fallback;
    }
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
    return fallback;
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
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => navigate(-1)}
              className="hover:text-dark-brown transition-colors"
            >
              ← Back
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/${product.category === 'timber' ? 'timber-products' : product.category === 'furniture' ? 'furniture' : 'construction-materials'}`)}
              className="hover:text-dark-brown transition-colors capitalize"
            >
              {product.category}
            </button>
            {product.subcategory && (
              <>
                <span>/</span>
                <span className="text-dark-brown capitalize">{product.subcategory}</span>
              </>
            )}
          </div>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Section - Product Images */}
          <div className="space-y-6">
            {/* Main Product Image */}
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
              <img
                src={getImageUrl(product.images[selectedImageIndex] || product.images[0])}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image';
                }}
              />
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === index 
                        ? 'border-dark-brown ring-2 ring-dark-brown ring-opacity-20' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100/f3f4f6/9ca3af?text=No+Image';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Section - Product Information */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="space-y-4">
              {/* Category Badge */}
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                  {product.category}
                  {product.subcategory && ` > ${product.subcategory}`}
                </span>
                {product.featuredType !== 'none' && (
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-accent-red text-white capitalize">
                    {product.featuredType === 'best' ? 'Best Seller' : product.featuredType === 'new' ? 'New Arrival' : 'Discounted'}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-dark-brown leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-dark-brown">
                  {formatINR(product.price)}
                </span>
                <span className="text-lg text-gray-600">per {product.unit}</span>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-semibold text-dark-brown mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Write a Review Button */}
            <div className="my-6 py-6 border-y border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-dark-brown">Customer Ratings & Reviews</h3>
                {product.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {product.rating.toFixed(1)} ({product.reviewCount || 0} {product.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    showError('Please login to write a review');
                    navigate('/login');
                    return;
                  }
                  setShowReviewModal(true);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-dark-brown to-accent-red text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Write a Review
              </button>
            </div>

            {/* Specifications */}
            <div>
              <button
                onClick={() => setShowSpecifications(!showSpecifications)}
                className="flex items-center justify-between w-full text-left text-lg font-semibold text-dark-brown mb-4 hover:text-accent-red transition-colors duration-200"
              >
                <span>Specifications</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${showSpecifications ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showSpecifications && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.size && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Size</span>
                        <span className="text-sm font-semibold text-dark-brown">{product.size}</span>
                      </div>
                    )}
                    {product.unit && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Unit</span>
                        <span className="text-sm font-semibold text-dark-brown">{product.unit}</span>
                      </div>
                    )}
                    {product.material && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Material</span>
                        <span className="text-sm font-semibold text-dark-brown">{product.material}</span>
                      </div>
                    )}
                    {product.color && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Color</span>
                        <span className="text-sm font-semibold text-dark-brown">{product.color}</span>
                      </div>
                    )}
                    {product.brand && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Brand</span>
                        <span className="text-sm font-semibold text-dark-brown">{product.brand}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Weight</span>
                        <span className="text-sm font-semibold text-dark-brown">{product.weight}</span>
                      </div>
                    )}
                    {product.featuredType && product.featuredType !== 'none' && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Featured Type</span>
                        <span className="text-sm font-semibold text-dark-brown capitalize">
                          {product.featuredType === 'best' ? 'Best Seller' : product.featuredType === 'new' ? 'New Arrival' : 'Discounted'}
                        </span>
                      </div>
                    )}
                    {product.quantity && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Stock Available</span>
                        <span className="text-sm font-semibold text-dark-brown">{product.quantity} units</span>
                      </div>
                    )}
                    {product.attributes && Object.keys(product.attributes).length > 0 && (
                      Object.entries(product.attributes).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-sm font-medium text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-sm font-semibold text-dark-brown">
                            {value}
                            {key === 'length' || key === 'width' ? ' ft' : ''}
                            {key === 'thickness' ? ' in' : ''}
                            {key === 'height' ? ' ft' : ''}
                            {key === 'diameter' ? ' in' : ''}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Purchase Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="space-y-6">
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
                  <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:text-dark-brown hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-6 py-2 border-x border-gray-300 text-center min-w-[80px] font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-600 hover:text-dark-brown hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex items-center justify-between py-3 bg-gray-50 rounded-lg px-4">
                  <span className="text-sm font-medium text-gray-700">Total</span>
                  <span className="text-xl font-bold text-dark-brown">{formatINR(product.price * quantity)}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Primary Actions - Side by Side */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex items-center justify-center gap-2 bg-dark-brown text-white py-4 px-4 rounded-lg font-semibold hover:bg-accent-red transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex items-center justify-center gap-2 bg-orange-500 text-white py-4 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Buy Now
                    </button>
                  </div>
                  {/* Secondary Action */}
                  <button
                    onClick={handleAddToWishlist}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 border-2 border-dark-brown text-dark-brown rounded-lg font-semibold hover:bg-dark-brown hover:text-white transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Add to Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        {product && (
          <div className="max-w-7xl mx-auto px-6">
            <SimilarProducts productId={product._id} maxItems={4} />

            {/* Customer Reviews Section */}
            <ProductReviews productId={product._id} />
          </div>
        )}
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          product={product}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false);
            // Refresh product data to show updated rating
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
