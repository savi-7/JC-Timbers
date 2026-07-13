import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch cart count
  const fetchCartCount = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const response = await api.get('/cart');
        const items = response.data.items || [];
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } catch {
        setCartCount(0);
      }
    } else {
      // Check guest cart in localStorage
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        try {
          const cartData = JSON.parse(guestCart);
          const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalItems);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    }
  }, [isAuthenticated]);

  // Fetch wishlist count
  const fetchWishlistCount = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const response = await api.get('/wishlist');
        const wishlistItems = response.data.items || [];
        setWishlistCount(wishlistItems.length);
      } catch {
        setWishlistCount(0);
      }
    } else {
      const guestWishlist = localStorage.getItem('guestWishlist');
      if (guestWishlist) {
        try {
          const wishlistData = JSON.parse(guestWishlist);
          setWishlistCount(wishlistData.items?.length || 0);
        } catch {
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0);
      }
    }
  }, [isAuthenticated]);

  // Refresh both counts
  const refreshCounts = useCallback(() => {
    fetchCartCount();
    fetchWishlistCount();
  }, [fetchCartCount, fetchWishlistCount]);

  // Initial fetch on mount and auth change
  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();
  }, [fetchCartCount, fetchWishlistCount]);

  const value = {
    cartCount,
    wishlistCount,
    refreshCartCount: fetchCartCount,
    refreshWishlistCount: fetchWishlistCount,
    refreshCounts,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};


