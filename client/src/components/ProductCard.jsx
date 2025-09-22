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
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={getMainImage()}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={isAddingToWishlist}
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-600 hover:text-accent-red p-2 rounded-full shadow-md transition-all duration-200 z-10"
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isAddingToWishlist ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-accent-red rounded-full animate-spin"></div>
          ) : (
            <svg 
              className={`w-4 h-4 ${isWishlisted ? 'fill-accent-red text-accent-red' : 'fill-none'}`} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-dark-brown text-white text-xs px-2 py-1 rounded-full font-medium capitalize">
          {product.category}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Attributes */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <div className="mb-3">
            {product.size && (
              <div className="text-sm text-gray-500 mb-1">
                <span className="font-medium">Size:</span> {product.size}
              </div>
            )}
            {product.unit && (
              <div className="text-sm text-gray-500 mb-1">
                <span className="font-medium">Unit:</span> {product.unit}
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xl font-bold text-gray-900">
              {formatINR(product.price)}
            </p>
            <p className="text-sm text-gray-500">
              per {product.unit}
            </p>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCartClick}
          className="w-full py-2 px-4 rounded-lg font-paragraph transition-colors duration-200 bg-dark-brown hover:bg-accent-red text-white hover:shadow-md transform hover:scale-105"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
