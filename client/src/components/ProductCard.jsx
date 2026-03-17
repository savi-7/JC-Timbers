import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useNotification } from '../components/NotificationProvider';
import ShareModal from './ShareModal';

const ProductCard = memo(({ product, onAddToCart, onBuyNow, onWishlistUpdate, variants }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getImageUrl = (image) => {
    const fallback = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=No+Image';
    if (!image) return fallback;
    if (image.url) return image.url;
    if (image.data) {
      if (image.data.startsWith('data:') || image.data.startsWith('http')) return image.data;
      return `data:${image.contentType || 'image/jpeg'};base64,${image.data}`;
    }
    return fallback;
  };

  const images = product.images && product.images.length > 0 ? product.images : [];
  // On listing, show only the cover image (first with isCover, else first image)
  const coverImage = images.length > 0
    ? (images.find((img) => img.isCover) || images[0])
    : null;
  const displayImages = coverImage ? [coverImage] : [];
  const hasMultipleImages = displayImages.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on the add to cart button
    if (e.target.closest('button') && !e.target.dataset.interactive) {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative bg-cream rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-[400px] cursor-pointer will-change-transform"
      onClick={handleCardClick}
      data-interactive="true"
    >
      {/* Product Image Full Bleed & Carousel */}
      <div className="absolute inset-0 z-0 bg-gray-100 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}
        <img
          src={displayImages.length > 0 ? getImageUrl(displayImages[currentImageIndex]) : 'https://via.placeholder.com/400x400/f8fafc/e2e8f0?text=No+Image'}
          alt={`${product.name} item ${currentImageIndex + 1}`}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-70 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none z-10"></div>

        {/* Carousel Navigation Arrows */}
        {hasMultipleImages && (
          <div className="absolute inset-0 flex items-center justify-between px-3 md:opacity-0 group-hover:opacity-100 opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
            <button
              onClick={prevImage}
              className="p-1.5 md:p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-dark-brown transition-colors shadow-sm pointer-events-auto"
              aria-label="Previous image"
              data-interactive="true"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="p-1.5 md:p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-dark-brown transition-colors shadow-sm pointer-events-auto"
              aria-label="Next image"
              data-interactive="true"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Carousel DOT Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-[80px] md:bottom-[70px] left-0 right-0 flex justify-center gap-1.5 z-20 md:opacity-0 group-hover:opacity-100 opacity-100 transition-opacity duration-300 pointer-events-none">
            {displayImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${currentImageIndex === idx ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/50 backdrop-blur-sm'}`}
              />
            ))}
          </div>
        )}
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
        <div className="flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShareModal(true);
            }}
            className="p-2.5 rounded-full bg-white/70 backdrop-blur-sm text-dark-brown hover:bg-white transition-colors duration-200 shadow-sm"
            title="Share"
            data-interactive="true"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
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
      </div>

      {/* Share modal for this product */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/product/${product._id}` : ''}
        shareTitle={product.name}
      />

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
            {product.productType === 'made-to-order' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/furniture/request-quote', { state: { product } });
                }}
                className="col-span-2 py-2.5 px-2 rounded-lg font-medium transition-all duration-200 bg-dark-brown text-white hover:bg-[#5b2a32] shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 text-xs w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Request Custom Quote
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
