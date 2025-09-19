import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';

export default function Cart() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuestCart, setIsGuestCart] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        // Fetch from server for authenticated users
        const res = await api.get('/cart');
        setItems(res.data.items || []);
        setTotal(res.data.total || 0);
        setIsGuestCart(false);
      } else {
        // Load from localStorage for guest users
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const cartData = JSON.parse(guestCart);
          setItems(cartData.items || []);
          setTotal(cartData.total || 0);
        } else {
          setItems([]);
          setTotal(0);
        }
        setIsGuestCart(true);
      }
      
      setError(null);
    } catch (e) {
      console.error('Cart fetch error:', e);
      
      // Only fall back to guest cart if user is NOT authenticated
      if (!isAuthenticated) {
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const cartData = JSON.parse(guestCart);
          setItems(cartData.items || []);
          setTotal(cartData.total || 0);
        } else {
          setItems([]);
          setTotal(0);
        }
        setIsGuestCart(true);
      } else {
        // For authenticated users, show empty cart if API fails
        setItems([]);
        setTotal(0);
        setIsGuestCart(false);
        setError('Failed to load cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    console.log('Cart component - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);
    
    // Wait for authentication to load before fetching cart
    if (!authLoading) {
      fetchCart(); 
    }
    
    // Check for pending cart item from login flow
    const pendingCartItem = localStorage.getItem('pendingCartItem');
    if (pendingCartItem) {
      try {
        const item = JSON.parse(pendingCartItem);
        // Check if item is recent (within 5 minutes)
        if (Date.now() - item.timestamp < 5 * 60 * 1000) {
          addPendingItemToCart(item);
        } else {
          // Remove expired pending item
          localStorage.removeItem('pendingCartItem');
        }
      } catch (error) {
        console.error('Error parsing pending cart item:', error);
        localStorage.removeItem('pendingCartItem');
      }
    }
  }, [authLoading, isAuthenticated]);

  const addPendingItemToCart = async (item) => {
    try {
      await api.post('/cart', { productId: item.productId, quantity: item.quantity });
      // Remove the pending item
      localStorage.removeItem('pendingCartItem');
      // Refresh cart to show the new item
      fetchCart();
      // Show success message
      showSuccess(`${item.productName} has been added to your cart!`);
    } catch (error) {
      console.error('Error adding pending item to cart:', error);
      showError('Failed to add item to cart. Please try again.');
    }
  };

  const updateQty = async (productId, qty) => {
    if (qty < 1) return;
    
    if (isAuthenticated) {
      try {
        await api.patch('/cart', { productId, quantity: qty });
        fetchCart();
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to update quantity');
      }
    } else {
      // Update guest cart in localStorage
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        const cartData = JSON.parse(guestCart);
        const itemIndex = cartData.items.findIndex(item => item.productId === productId);
        if (itemIndex !== -1) {
          cartData.items[itemIndex].quantity = qty;
          cartData.items[itemIndex].subtotal = cartData.items[itemIndex].price * qty;
          cartData.total = cartData.items.reduce((sum, item) => sum + item.subtotal, 0);
          localStorage.setItem('guestCart', JSON.stringify(cartData));
          fetchCart();
        }
      }
    }
  };

  const removeItem = async (productId) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/cart/${productId}`);
        fetchCart();
        showSuccess('Item removed from cart');
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to remove item');
      }
    } else {
      // Remove from guest cart in localStorage
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        const cartData = JSON.parse(guestCart);
        cartData.items = cartData.items.filter(item => item.productId !== productId);
        cartData.total = cartData.items.reduce((sum, item) => sum + item.subtotal, 0);
        localStorage.setItem('guestCart', JSON.stringify(cartData));
        fetchCart();
        showSuccess('Item removed from cart');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {authLoading ? (
        <div className="text-center py-8">
          <p>Loading authentication...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Cart</h1>
            {isGuestCart && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  You're shopping as a guest. 
                  <button 
                    onClick={() => navigate('/login')} 
                    className="ml-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    Sign in
                  </button> 
                  to save your cart and checkout.
                </p>
              </div>
            )}
          </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <div className="text-center bg-gray-50 p-10 rounded">
          <p>Your cart is empty.</p>
          <button onClick={() => navigate('/customer-home')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Go to Home</button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.productId} className="flex items-center justify-between bg-white p-4 rounded shadow">
              <div className="flex items-center gap-4">
                <img 
                  src={item.image || 'https://via.placeholder.com/80/f3f4f6/9ca3af?text=No+Image'} 
                  alt={item.name} 
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80/f3f4f6/9ca3af?text=No+Image';
                  }}
                />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">₹{item.price} x {item.quantity} = ₹{item.subtotal}</div>
                  <div className="text-xs text-gray-400">Available: {item.available}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="px-3 py-1 bg-gray-200 rounded">-</button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="px-3 py-1 bg-gray-200 rounded">+</button>
                <button onClick={() => removeItem(item.productId)} className="ml-4 px-3 py-1 bg-red-600 text-white rounded">Remove</button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center border-t pt-4">
            <div className="text-lg font-semibold">Total: ₹{total}</div>
            <div className="text-sm text-gray-600">
              Cart functionality complete - Items ready for processing
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}










