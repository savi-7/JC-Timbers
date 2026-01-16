import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';

const BUYER_OPTIONS = [
  'Saved Items',
  'Inbox',
  'Recently Viewed',
  'Marketplace Following',
  'Location',
];

const SELLER_OPTIONS = [
  'Seller Profile',
  'My Listings',
  'Marketplace Followers',
  'Inbox',
  'Location',
];

export default function MarketplaceProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const [isSellerEnabled, setIsSellerEnabled] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Check if seller dashboard is enabled
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        const sellerData = localStorage.getItem(`seller_dashboard_${user.email}`);
        setIsSellerEnabled(!!sellerData);
      } catch (error) {
        console.error('Error checking seller dashboard:', error);
      }
    }
  }, [isAuthenticated, user]);

  const handleOptionClick = (option, isSeller = false) => {
    // Navigate to respective pages
    if (isSeller) {
      switch (option) {
        case 'Seller Profile':
          navigate('/marketplace/seller-profile');
          break;
        case 'My Listings':
          navigate('/marketplace/my-listings');
          break;
        case 'Marketplace Followers':
          navigate('/marketplace/seller-followers');
          break;
        case 'Inbox':
          navigate('/marketplace/seller-inbox');
          break;
        case 'Location':
          navigate('/marketplace/seller-location');
          break;
        default:
          console.log(`Clicked: ${option}`);
          break;
      }
    } else {
      switch (option) {
        case 'Saved Items':
          navigate('/marketplace/saved-items');
          break;
        case 'Inbox':
          navigate('/marketplace/inbox');
          break;
        case 'Recently Viewed':
          navigate('/marketplace/recently-viewed');
          break;
        case 'Marketplace Following':
          navigate('/marketplace/following');
          break;
        case 'Location':
          navigate('/marketplace/location');
          break;
        default:
          console.log(`Clicked: ${option}`);
          break;
      }
    }
  };

  // Show nothing while checking authentication or if not authenticated
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="bg-white">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 text-gray-600 hover:text-dark-brown transition-colors mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-paragraph text-sm">Back to Marketplace</span>
          </button>

          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-dark-brown to-accent-red flex items-center justify-center text-white text-2xl font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="font-heading text-2xl text-dark-brown mb-1">
                  {user?.name || 'Guest User'}
                </h1>
                <p className="text-sm text-gray-500">{user?.email || 'guest@example.com'}</p>
              </div>
            </div>
          </div>

          {/* Buyer Dashboard */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading text-lg text-dark-brown">Buyer Dashboard</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage your marketplace activity and preferences as a buyer
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {BUYER_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option, false)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-accent-red/10 transition-colors">
                      {getOptionIcon(option, false)}
                    </div>
                    <span className="font-paragraph text-gray-700 group-hover:text-dark-brown transition-colors">
                      {option}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Seller Dashboard */}
          {isSellerEnabled ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-heading text-lg text-dark-brown">Seller Dashboard</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your seller profile and listings
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {SELLER_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOptionClick(option, true)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-accent-red/10 transition-colors">
                        {getOptionIcon(option, true)}
                      </div>
                      <span className="font-paragraph text-gray-700 group-hover:text-dark-brown transition-colors">
                        {option}
                      </span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg text-dark-brown mb-2">Seller Dashboard</h2>
                  <p className="text-sm text-gray-500">
                    Enable seller dashboard to start listing products
                  </p>
                </div>
                <button
                  onClick={() => navigate('/marketplace/enable-seller')}
                  className="px-6 py-2.5 text-sm font-paragraph rounded-lg bg-accent-red text-white hover:bg-accent-red/90 transition-colors"
                >
                  Enable Seller Dashboard
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Icon component for each option
function getOptionIcon(option, isSeller = false) {
  const iconClass = "h-5 w-5 text-gray-500 group-hover:text-accent-red transition-colors";
  
  if (isSeller) {
    switch (option) {
      case 'Seller Profile':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'My Listings':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
      case 'Marketplace Followers':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'Inbox':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'Location':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        );
    }
  } else {
    switch (option) {
      case 'Saved Items':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'Inbox':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'Recently Viewed':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Marketplace Following':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'Location':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        );
    }
  }
}

