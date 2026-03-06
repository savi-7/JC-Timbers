import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useNotification } from '../components/NotificationProvider';

const ProductCard = memo(({ product, onAddToCart, onBuyNow, onWishlistUpdate, variants }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMainImage = () => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];

      // Check if it's the old Cloudinary format
      if (firstImage.url) {
        return firstImage.url;
      }

      // Check if it's the new MongoDB format with data
      if (firstImage.data) {
        // If data starts with 'data:', it's already a data URL
        if (firstImage.data.startsWith('data:')) {
          return firstImage.data;
        }
        // If data starts with 'http', it's a URL
        if (firstImage.data.startsWith('http')) {
          return firstImage.data;
        }
        // Otherwise, construct the data URL
        return `data:${firstImage.contentType || 'image/jpeg'};base64,${firstImage.data}`;
      }
    }

    // Return a placeholder image if no images exist
    return 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image';
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on the add to cart button
    if (e.target.closest('button')) {
      return;
    }
    navigate(`/product/${product._id}`);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation(); // Prevent card click
    onAddToCart(product);
  };

  const handleBuyNowClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onBuyNow) {
      onBuyNow(product);
    }
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation(); // Prevent card click

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

    setIsAddingToWishlist(true);
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product._id}`);
        setIsWishlisted(false);
        showSuccess(t('products.removedFromWishlist'));
      } else {
        await api.post(`/wishlist/${product._id}`);
        setIsWishlisted(true);
        showSuccess(t('products.addedToWishlist'));
      }
      // Notify parent component to update wishlist count
      if (onWishlistUpdate) {
        onWishlistUpdate();
      }
    } catch (err) {
      console.error('Wishlist operation failed', err);
      const msg = err?.response?.data?.message || 'Failed to update wishlist';
      showError(msg);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }}
      viewport={{ once: true, margin: "100px" }}
      className="group relative bg-cream rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-[400px] cursor-pointer will-change-transform"
      onClick={handleCardClick}
    >
      {/* Product Image Full Bleed */}
      <div className="absolute inset-0 z-0 bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}
        <img
          src={getMainImage()}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out z-10 relative will-change-transform"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400/f8fafc/e2e8f0?text=No+Image';
            setImageLoaded(true);
          }}
        />
        {/* Subtle dark gradient overlay to ensure bottom glass stands out if image is light */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-70 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none"></div>
      </div>

      {/* Top Overlay: Badge & Wishlist */}
      <div className="relative z-10 p-4 flex justify-between items-start">
        <div className="flex flex-col gap-2">
          {product.featuredType && product.featuredType !== 'none' && (
            <span className="bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full text-dark-brown shadow-sm inline-block w-fit">
              {product.featuredType === 'best' ? 'Best Seller' : product.featuredType === 'new' ? 'New Arrival' : 'Discounted'}
            </span>
          )}
        </div>
        <button
          onClick={handleWishlistClick}
          disabled={isAddingToWishlist}
          className="p-2.5 rounded-full bg-white/70 backdrop-blur-sm text-dark-brown hover:text-accent-red hover:bg-white transition-colors duration-200 shadow-sm"
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isAddingToWishlist ? (
            <div className="w-5 h-5 border-2 border-white/50 border-t-accent-red rounded-full animate-spin"></div>
          ) : (
            <svg
              className={`w-5 h-5 transition-all duration-300 md:group-hover:scale-110 ${isWishlisted ? 'fill-accent-red text-accent-red' : 'fill-none stroke-current'}`}
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Bottom Glass Panel */}
      <div className="relative z-10 mt-auto p-3 transform md:translate-y-14 translate-y-0 group-hover:translate-y-0 transition-transform duration-300 ease-out will-change-transform">
        <div className="bg-white/95 backdrop-blur-sm border border-white/50 shadow-lg rounded-xl p-4 flex flex-col gap-1">
          {/* Title and Price row */}
          <div className="flex justify-between items-start gap-3">
            <h3 className="text-lg font-heading font-medium text-dark-brown leading-tight line-clamp-1 flex-1">
              {product.name}
            </h3>
            <div className="text-right">
              <p className="text-lg font-bold text-accent-red whitespace-nowrap">
                {formatINR(product.price)}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-paragraph">
            {t('products.per')} {product.unit} {product.size ? ` • ${product.size}` : ''}
          </p>

          {/* Action Buttons: Hidden on default desktop, shown on hover (always shown on mobile since no hover) */}
          <div className="mt-4 grid grid-cols-2 gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            <button
              onClick={handleAddToCartClick}
              className="py-2.5 px-2 rounded-lg font-medium transition-all duration-200 bg-dark-brown text-white hover:bg-[#5b2a32] shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 text-xs w-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {t('products.addToCart')}
            </button>
            <button
              onClick={handleBuyNowClick}
              className="py-2.5 px-2 rounded-lg font-medium transition-all duration-200 bg-accent-red text-white hover:bg-red-700 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 text-xs w-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t('products.buyNow')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
