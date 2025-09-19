import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
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

  const isLowStock = product.quantity < 50;

  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
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
        
        {/* Limited Stock Badge */}
        {isLowStock && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Limited Stock
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium capitalize">
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

        {/* Price and Stock */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xl font-bold text-gray-900">
              {formatINR(product.price)}
            </p>
            <p className="text-sm text-gray-500">
              {product.quantity < 50 ? 'Limited Stock' : `Stock: ${product.quantity} ${product.unit}`}
            </p>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.quantity === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
            product.quantity === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
          }`}
        >
          {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
