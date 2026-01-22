import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from 'react-i18next';
import dashboardImg from "../assets/livingroom.png";
import api from "../api/axios";
// import { useNotification } from './NotificationProvider';

export default function CustomerHero() {
  const navigate = useNavigate();
  const { user,  isAuthenticated } = useAuth();
  const { t } = useTranslation();
  // const { showInfo } = useNotification();
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [, setCartCount] = useState(0);
  const [, setWishlistCount] = useState(0);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShopDropdown && !event.target.closest('.shop-dropdown')) {
        setShowShopDropdown(false);
      }
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShopDropdown, showProfileDropdown]);

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/cart');
          const items = response.data.items || [];
          const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalItems);
        } catch (error) {
          console.log('Cart fetch error:', error.response?.status, error.message);
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
    };

    fetchCartCount();
  }, [isAuthenticated]);

  // Fetch wishlist count
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/wishlist');
          const wishlistItems = response.data.items || [];
          setWishlistCount(wishlistItems.length);
        } catch (error) {
          console.log('Wishlist fetch error:', error.response?.status, error.message);
          setWishlistCount(0);
        }
      } else {
        // Check guest wishlist in localStorage
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
    };

    fetchWishlistCount();
  }, [isAuthenticated]);

  // const handleLogout = () => {
  //   logout();
  //   // Navigation is handled by the logout function in useAuth hook
  // };

  return (
    <section className="relative z-10">
      {/* Navigation Header */}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cream to-light-cream py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Personalized Greeting */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-heading text-dark-brown leading-tight">
                  {t('customerHero.welcomeBack')},<br />
                  <span className="text-accent-red">{user?.name || t('customerHero.valuedCustomer')}!</span>
                </h1>
                <p className="text-lg text-gray-700 font-paragraph leading-relaxed">
                  {t('customerHero.description')}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/timber-products')}
                  className="bg-dark-brown text-white px-8 py-4 rounded-lg font-paragraph hover:bg-accent-red transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t('customerHero.startShopping')}
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="border-2 border-dark-brown text-dark-brown px-8 py-4 rounded-lg font-paragraph hover:bg-dark-brown hover:text-white transition-colors duration-200"
                >
                  {t('customerHero.viewCart')}
                </button>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-dark-brown">500+</div>
                  <div className="text-sm text-gray-600">{t('customerHero.products')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-dark-brown">1000+</div>
                  <div className="text-sm text-gray-600">{t('customerHero.happyCustomers')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-dark-brown">24/7</div>
                  <div className="text-sm text-gray-600">{t('customerHero.support')}</div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src={dashboardImg}
                  alt="Premium Timber Products"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-red rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-dark-brown rounded-full opacity-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

