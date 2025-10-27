import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { API_BASE } from '../config';

export default function SimilarProducts({ productId, maxItems = 4 }) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchSimilarProducts();
    }
  }, [productId]);

  const fetchSimilarProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/recommendations/similar/${productId}?k=${maxItems}`);
      
      if (response.data.success) {
        setRecommendations(response.data.recommendations || []);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Error fetching similar products:', err);
      setError('Failed to load recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage.data) {
        return firstImage.data;
      }
    }
    return 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=No+Image';
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h3 className="text-2xl font-heading text-dark-brown mb-6">Similar Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Don't show anything if there's an error or no recommendations
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-heading text-dark-brown">Similar Products You May Like</h3>
        <span className="text-sm text-gray-500">
          Based on category, price, and specifications
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <div
            key={product._id}
            onClick={() => handleProductClick(product._id)}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 overflow-hidden"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gray-100">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=No+Image';
                }}
              />
              
              {/* Similarity Badge */}
              {product.similarityScore && product.similarityScore > 0.7 && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {Math.round(product.similarityScore * 100)}% Match
                </div>
              )}
              
              {/* Stock Status */}
              {product.quantity <= 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-medium">Out of Stock</span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h4 className="font-heading text-dark-brown text-lg mb-2 line-clamp-2 h-14">
                {product.name}
              </h4>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-accent-red font-bold text-xl">
                  {formatINR(product.price)}
                </span>
                {product.unit && (
                  <span className="text-xs text-gray-500">
                    per {product.unit}
                  </span>
                )}
              </div>
              
              {/* Match Reasons */}
              {product.matchReasons && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.matchReasons.priceMatch && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Similar Price
                    </span>
                  )}
                  {product.matchReasons.subcategoryMatch && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      Same Type
                    </span>
                  )}
                  {product.matchReasons.sizeMatch && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Same Size
                    </span>
                  )}
                </div>
              )}
              
              {/* Stock Info */}
              <div className="flex items-center justify-between text-sm">
                {product.quantity > 0 ? (
                  <span className="text-green-600 font-medium">
                    ✓ In Stock ({product.quantity})
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    Out of Stock
                  </span>
                )}
              </div>
              
              {/* View Details Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProductClick(product._id);
                }}
                className="w-full mt-3 bg-dark-brown text-white py-2 rounded-lg hover:bg-accent-red transition-colors duration-200 font-medium text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* KNN Info (optional, can be removed in production) */}
      {recommendations.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Recommendations powered by K-Nearest Neighbors algorithm
          </p>
        </div>
      )}
    </div>
  );
}

