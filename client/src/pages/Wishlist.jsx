import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';

const getProductImage = (product) => {
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
      // Otherwise, construct the data URL
      return `data:${firstImage.contentType || 'image/jpeg'};base64,${firstImage.data}`;
    }
  }
  
  // Fallback to old img property or placeholder
  return product.img || 'https://via.placeholder.com/80/f3f4f6/9ca3af?text=No+Image';
};

export default function Wishlist() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      setItems(res.data.items || []);
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

  const addToCart = async (product) => {
    try {
      await api.post('/cart', { productId: product._id, quantity: 1 });
      showSuccess(`${product.name} added to cart!`);
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <button 
          onClick={() => navigate('/customer-home')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
          {!isAuthenticated && (
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign In
            </button>
          )}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center bg-gray-50 p-10 rounded">
          <p>Your wishlist is empty.</p>
          <button onClick={() => navigate('/customer-home')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Go to Home</button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.productId} className="flex items-center justify-between bg-white p-4 rounded shadow">
              <div className="flex items-center gap-4">
                <img 
                  src={getProductImage(item.product) || 'https://via.placeholder.com/80/f3f4f6/9ca3af?text=No+Image'} 
                  alt={item.name} 
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80/f3f4f6/9ca3af?text=No+Image';
                  }}
                />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">₹{item.price}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => addToCart(item)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={() => removeFromWishlist(item.productId)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
