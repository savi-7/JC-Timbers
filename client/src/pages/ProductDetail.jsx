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
import ShareModal from '../components/ShareModal';
import { motion } from 'framer-motion';

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
  const [showShareModal, setShowShareModal] = useState(false);

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

  // Gallery images: exclude cover (cover is shown on listing only). If no isCover set, treat first as cover.
  const allImages = product?.images && product.images.length > 0 ? product.images : [];
  const coverIndex = allImages.findIndex((img) => img.isCover);
  const effectiveCoverIndex = coverIndex >= 0 ? coverIndex : 0;
  const detailImages = allImages.length <= 1
    ? allImages
    : allImages.filter((_, i) => i !== effectiveCoverIndex);
  const galleryImages = detailImages.length > 0 ? detailImages : allImages;

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Section - Product Images (reference layout: main image + overlays + thumbnail strip) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-0 lg:sticky lg:top-32"
          >
            {/* Main Product Image with overlay controls - object-contain so full product is visible */}
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg bg-gray-100 group flex items-center justify-center">
              <img
                src={getImageUrl(galleryImages[selectedImageIndex] || galleryImages[0])}
                alt={product.name}
                className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image';
                }}
              />

              {/* Top-left: Featured badge (New Arrivals / Best Seller / etc.) */}
              {product.featuredType && product.featuredType !== 'none' && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex px-3 py-1.5 text-sm font-semibold rounded-lg bg-orange-500 text-white shadow-md">
                    {product.featuredType === 'best' ? 'Best Seller' : product.featuredType === 'new' ? 'New Arrivals' : 'Discounted'}
                  </span>
                </div>
              )}

              {/* Left/Right navigation arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-lg bg-white/95 shadow-md flex items-center justify-center text-gray-800 hover:bg-white hover:scale-105 transition-all duration-200"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-lg bg-white/95 shadow-md flex items-center justify-center text-gray-800 hover:bg-white hover:scale-105 transition-all duration-200"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Bottom-left: View Similar Items + Wishlist */}
              <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => document.getElementById('similar-products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/95 shadow-md text-gray-800 font-medium text-sm hover:bg-white hover:shadow-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  </svg>
                  View Similar Items
                </button>
                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  className="w-10 h-10 rounded-lg bg-white/95 shadow-md flex items-center justify-center text-gray-700 hover:bg-white hover:text-accent-red transition-all duration-200 border border-gray-200"
                  title="Add to wishlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Bottom-right: Zoom hint */}
              <p className="absolute bottom-4 right-4 z-10 text-xs text-gray-500/90 bg-white/70 backdrop-blur-sm px-2 py-1 rounded">
                Roll over image to zoom in
              </p>
            </div>

            {/* Separator line between main image and thumbnail strip */}
            <div className="border-b border-gray-200 my-4" />

            {/* Thumbnail strip - horizontal scrollable gallery */}
            {galleryImages.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImageIndex === index
                      ? 'border-dark-brown ring-2 ring-dark-brown ring-opacity-30'
                      : 'border-gray-200 hover:border-gray-400'
                      }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No+Image';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Section - Product Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="space-y-10 lg:pb-32"
          >
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
              <h1 className="text-4xl lg:text-6xl font-heading font-extrabold text-dark-brown leading-[1.1] tracking-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline space-x-4 pt-4 border-t border-gray-200/60">
                <span className="text-4xl lg:text-5xl font-bold text-accent-red">
                  {formatINR(product.price)}
                </span>
                <span className="text-xl text-gray-500 font-medium font-paragraph">per {product.unit}</span>
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
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-red opacity-[0.03] blur-2xl rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-dark-brown opacity-[0.03] blur-3xl rounded-full pointer-events-none"></div>
              <div className="relative space-y-8">
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
                  {/* Primary Actions */}
                  {product.productType === 'made-to-order' ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/furniture/request-quote', { state: { product } })}
                      className="w-full flex items-center justify-center gap-2 bg-dark-brown text-white py-4 px-4 rounded-lg font-semibold hover:bg-accent-red transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Request Custom Quote
                    </motion.button>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddToCart}
                        className="flex items-center justify-center gap-2 bg-dark-brown text-white py-4 px-4 rounded-lg font-semibold hover:bg-accent-red transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Add to Cart
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBuyNow}
                        className="flex items-center justify-center gap-2 bg-orange-500 text-white py-4 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Buy Now
                      </motion.button>
                    </div>
                  )}
                  {/* Secondary Actions: Wishlist + Share */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleAddToWishlist}
                      className="flex items-center justify-center gap-2 py-3 px-6 border-2 border-dark-brown text-dark-brown rounded-lg font-semibold hover:bg-dark-brown hover:text-white transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Wishlist
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center justify-center gap-2 py-3 px-6 border-2 border-gray-400 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Similar Products Section */}
        {product && (
          <motion.div
            id="similar-products"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-6 mt-12 scroll-mt-24"
          >
            <SimilarProducts productId={product._id} maxItems={4} />

            {/* Customer Reviews Section */}
            <div className="mt-12">
              <ProductReviews productId={product._id} />
            </div>
          </motion.div>
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

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={product ? `${window.location.origin}/product/${product._id}` : ''}
        shareTitle={product?.name || ''}
      />
    </div>
  );
}
