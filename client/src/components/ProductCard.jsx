import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { useNotification } from '../components/NotificationProvider';

const ProductCard = ({ product, onAddToCart, onWishlistUpdate }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
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
      
      // Debug logging
      console.log('Product:', product.name, 'Image data:', firstImage.data);
      
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
        showSuccess('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${product._id}`);
        setIsWishlisted(true);
        showSuccess('Added to wishlist');
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
    <div 
      className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 overflow-hidden hover:border-gray-200 flex flex-col h-full"
      onClick={handleCardClick}
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-gray-50">
        <div className="aspect-square w-full">
          <img
            src={getMainImage()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300/f8fafc/e2e8f0?text=No+Image';
            }}
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col h-full">
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-dark-brown transition-colors duration-200 leading-tight">
          {product.name}
        </h3>
        
        {/* Description */}
        {product.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Key Specs */}
        <div className="mb-3 space-y-1">
          {product.size && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Size:</span>
              <span className="text-gray-900 font-medium">{product.size}</span>
            </div>
          )}
          {product.unit && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Unit:</span>
              <span className="text-gray-900 font-medium">{product.unit}</span>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-lg font-bold text-gray-900">
              {formatINR(product.price)}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-gray-400 line-through">
                {formatINR(product.originalPrice)}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500">
            per {product.unit}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCartClick}
            className="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 text-white hover:shadow-md transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm"
            style={{ backgroundColor: '#913F4A' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#7a3339'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#913F4A'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Cart
          </button>
          
          {/* Secondary Actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product._id}`);
              }}
              className="flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 text-dark-brown border border-dark-brown hover:bg-dark-brown hover:text-white flex items-center justify-center gap-1 text-xs"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>
            
            <button
              onClick={handleWishlistClick}
              disabled={isAddingToWishlist}
              className="px-3 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 border border-gray-300 hover:border-red-500 hover:text-red-500 flex items-center justify-center"
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isAddingToWishlist ? (
                <div className="w-3 h-3 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
              ) : (
                <svg 
                  className={`w-3 h-3 transition-all duration-200 ${isWishlisted ? 'fill-red-500 text-red-500' : 'fill-none'}`} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
