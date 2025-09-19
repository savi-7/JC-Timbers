import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import dashboardImg from "../assets/livingroom.png";
import api from "../api/axios";
import { useNotification } from './NotificationProvider';

export default function CustomerHero() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { showInfo } = useNotification();
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);

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
          } catch (error) {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }
      }
    };

    fetchCartCount();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <section className="relative">
      {/* Navigation Header */}
      <nav className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left - Brand Name */}
            <div className="text-xl font-paragraph text-dark-brown tracking-wide">
              JC Timbers
            </div>
            
            {/* Center - Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="relative shop-dropdown">
                <button 
                  onClick={() => setShowShopDropdown(!showShopDropdown)}
                  className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph flex items-center gap-1"
                >
                  Shop All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showShopDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button 
                      onClick={() => { navigate('/timber-products'); setShowShopDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream"
                    >
                      Timber Products
                    </button>
                    <button 
                      onClick={() => { navigate('/furniture'); setShowShopDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream"
                    >
                      Furniture
                    </button>
                    <button 
                      onClick={() => { navigate('/construction-materials'); setShowShopDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream"
                    >
                      Construction Materials
                    </button>
                  </div>
                )}
              </div>
              <button className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph">
                About
              </button>
              <button className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph">
                Contact
              </button>
            </div>
            
            {/* Right - Profile and Cart */}
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 text-dark-brown hover:text-accent-red transition-colors duration-200 p-2 rounded-lg hover:bg-cream"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-dark-brown to-accent-red rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block font-paragraph">{user?.name || 'User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-200">
                    {/* Profile Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-dark-brown">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-2">
                        Customer
                      </span>
                    </div>
                    
                    {/* Profile Options */}
                    <div className="py-1">
                      <button 
                        onClick={() => { navigate('/wishlist'); setShowProfileDropdown(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream transition-colors duration-150"
                      >
                        My Wishlist
                      </button>
                      <button 
                        onClick={() => { navigate('/cart'); setShowProfileDropdown(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream transition-colors duration-150"
                      >
                        My Cart
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={() => {
                          setShowProfileDropdown(false);
                          // TODO: Implement change password functionality
                          showInfo('Change password functionality coming soon!');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream transition-colors duration-150"
                      >
                        Change Password
                      </button>
                      <button 
                        onClick={() => {
                          setShowProfileDropdown(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Cart Icon */}
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="relative cursor-pointer p-2 rounded-full hover:bg-cream focus:outline-none focus:ring-2 focus:ring-accent-red"
                aria-label="Shopping Cart"
                title="Shopping Cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-6 h-6 text-dark-brown hover:text-accent-red transition-colors duration-200"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {/* Cart Count Badge */}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cream to-light-cream py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Personalized Greeting */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-heading text-dark-brown leading-tight">
                  Welcome back,<br />
                  <span className="text-accent-red">{user?.name || 'Valued Customer'}!</span>
                </h1>
                <p className="text-lg text-gray-700 font-paragraph leading-relaxed">
                  Discover premium timber products, custom furniture, and construction materials 
                  tailored to your needs. Your personalized shopping experience awaits.
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/timber-products')}
                  className="bg-dark-brown text-white px-8 py-4 rounded-lg font-paragraph hover:bg-accent-red transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Shopping
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="border-2 border-dark-brown text-dark-brown px-8 py-4 rounded-lg font-paragraph hover:bg-dark-brown hover:text-white transition-colors duration-200"
                >
                  View Cart
                </button>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-dark-brown">500+</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-dark-brown">1000+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-dark-brown">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
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






