import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';

export default function SellerFollowers() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFollowers();
    }
  }, [isAuthenticated, user]);

  const loadFollowers = () => {
    try {
      // Get all users who are following this seller
      const allFollowing = [];
      const keys = Object.keys(localStorage);
      
      keys.forEach((key) => {
        if (key.startsWith('marketplace_following_')) {
          try {
            const followingData = JSON.parse(localStorage.getItem(key) || '[]');
            if (followingData.includes(user.email)) {
              // Extract user email from key
              const followerEmail = key.replace('marketplace_following_', '');
              allFollowing.push(followerEmail);
            }
          } catch (error) {
            console.error(`Error parsing following data from ${key}:`, error);
          }
        }
      });

      setFollowers(allFollowing);
    } catch (error) {
      console.error('Error loading followers:', error);
      setFollowers([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="bg-white">
        <MarketplaceHeader
          userName={user?.name}
          userEmail={user?.email}
          onSearchChange={() => {}}
          onCategorySelect={() => {}}
          onSellClick={() => navigate('/marketplace/create-listing')}
        />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/marketplace/profile')}
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
            <span className="font-paragraph text-sm">Back to Profile</span>
          </button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="font-heading text-2xl text-dark-brown mb-2">Marketplace Followers</h1>
            <p className="text-sm text-gray-500">
              Buyers who are following your listings
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading followers...</p>
            </div>
          ) : followers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="font-heading text-lg text-dark-brown mb-2">No followers yet</h3>
              <p className="text-sm text-gray-500">
                Buyers will appear here when they follow your listings
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-medium text-gray-700">
                  {followers.length} {followers.length === 1 ? 'Follower' : 'Followers'}
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {followers.map((followerEmail, index) => (
                  <div key={index} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dark-brown to-accent-red flex items-center justify-center text-white text-lg font-semibold">
                      {followerEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-dark-brown">
                        {followerEmail.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500">{followerEmail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

