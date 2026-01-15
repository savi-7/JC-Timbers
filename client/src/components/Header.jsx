import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import { useLocation } from 'react-router-dom';

export default function Header({backgroundClass = 'bg-cream'}) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount, wishlistCount } = useCart();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const location = useLocation();

  // Click outside handler for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
  };

  return (
    <nav className={`${backgroundClass}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left - Brand Name */}
          <div 
            className="text-xl font-paragraph text-dark-brown tracking-wide cursor-pointer"
            onClick={() => navigate('/')}
          >
            JC Timbers
          </div>
          
          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate(location.pathname === '/' ? '/' : '/customer-home')}
              className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
            >
              Home
            </button>
            
            <button 
              onClick={() => navigate('/timber-products')}
              className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
            >
              Timber Products
            </button>

            <button 
              onClick={() => navigate('/furniture')}
              className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
            >
              Furniture
            </button>

            <button 
              onClick={() => navigate('/construction-materials')}
              className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
            >
              Construction Materials
            </button>
            
            <button 
              onClick={() => navigate('/marketplace')}
              className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
            >
              Marketplace
            </button>
            
            <button 
              onClick={() => {
                navigate('/about');
                // Scroll to about us section after navigation
                // setTimeout(() => {
                //   const aboutSection = document.getElementById('about-us');
                //   if (aboutSection) {
                //     aboutSection.scrollIntoView({ behavior: 'smooth' });
                //   }
                // }, 100);
              }}
              className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
            >
              About Us
            </button>
            
            <button 
              onClick={() => navigate('/contact-us')}
              className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
            >
              Contact Us
            </button>
          </div>
          
          {/* Right - Profile, Wishlist, and Cart */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
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
                          {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                        </span>
                      </div>
                      
                      {/* Profile Options */}
                      <div className="py-1">
                        {user?.role === 'admin' ? (
                          <>
                            <button
                              onClick={() => {
                                navigate('/admin/dashboard');
                                setShowProfileDropdown(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream transition-colors duration-150"
                            >
                              Admin Dashboard
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                navigate('/customer-profile');
                                setShowProfileDropdown(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream transition-colors duration-150"
                            >
                              My Profile
                            </button>
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
                          </>
                        )}
                        <button 
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Wishlist Icon */}
                <button
                  type="button"
                  onClick={() => navigate('/wishlist')}
                  className="relative cursor-pointer p-2 rounded-full hover:bg-cream focus:outline-none focus:ring-2 focus:ring-accent-red"
                  aria-label="Wishlist"
                  title="Wishlist"
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
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {/* Wishlist Count Badge */}
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              /* Login Icon for unauthenticated users */
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="cursor-pointer p-2 rounded-full hover:bg-cream focus:outline-none focus:ring-2 focus:ring-accent-red"
                aria-label="Profile / Login"
                title="Profile / Login"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-6 h-6 text-dark-brown hover:text-accent-red transition-colors duration-200"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  <path d="M4.5 19.5a7.5 7.5 0 0115 0" />
                </svg>
              </button>
            )}
            
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
  );
}

