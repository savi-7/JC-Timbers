import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';

const PROFILE_OPTIONS = [
  'Saved Items',
  'Inbox',
  'Reviews',
  'Recently Viewed',
  'My Listings',
  'Marketplace Followers',
  'Following',
  'Location',
];

export default function MarketplaceProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleOptionClick = (option) => {
    // Navigate to respective pages
    switch (option) {
      case 'My Listings':
        navigate('/marketplace/my-listings');
        break;
      case 'Inbox':
        navigate('/marketplace/inbox');
        break;
      default:
        console.log(`Clicked: ${option}`);
        // Add navigation for other options as they're implemented
        break;
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

          {/* Profile Options */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading text-lg text-dark-brown">Marketplace Profile</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage your marketplace activity and preferences
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {PROFILE_OPTIONS.map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon placeholder - you can add specific icons for each option */}
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-accent-red/10 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500 group-hover:text-accent-red transition-colors"
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
        </section>
      </main>
    </div>
  );
}

