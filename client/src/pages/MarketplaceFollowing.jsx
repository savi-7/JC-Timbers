import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';

export default function MarketplaceFollowing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { showError } = useNotification();
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFollowing();
    }
  }, [isAuthenticated, user]);

  const loadFollowing = () => {
    try {
      // Get following list from localStorage
      const followingData = JSON.parse(
        localStorage.getItem(`marketplace_following_${user.email}`) || '[]'
      );

      // Get all listings to get seller info
      const allListings = [];
      const keys = Object.keys(localStorage);
      
      keys.forEach((key) => {
        if (key.startsWith('marketplace_listings_')) {
          try {
            const userListings = JSON.parse(localStorage.getItem(key) || '[]');
            allListings.push(...userListings);
          } catch (error) {
            console.error(`Error parsing listings from ${key}:`, error);
          }
        }
      });

      // Get unique sellers from following list
      const sellerEmails = [...new Set(followingData)];
      
      // Get seller info and their listings
      const sellersWithListings = sellerEmails.map((sellerEmail) => {
        const sellerListings = allListings.filter(
          (listing) => listing.userId === sellerEmail && listing.status === 'active'
        );
        
        // Get seller name from first listing or use email
        const sellerName = sellerListings.length > 0 
          ? sellerListings[0].userName || sellerEmail.split('@')[0]
          : sellerEmail.split('@')[0];

        return {
          email: sellerEmail,
          name: sellerName,
          listingsCount: sellerListings.length,
          listings: sellerListings.slice(0, 3), // Show first 3 listings
        };
      });

      setFollowing(sellersWithListings);
    } catch (error) {
      console.error('Error loading following:', error);
      setFollowing([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = (sellerEmail) => {
    if (!window.confirm(`Are you sure you want to unfollow ${sellerEmail.split('@')[0]}?`)) {
      return;
    }

    try {
      const followingData = JSON.parse(
        localStorage.getItem(`marketplace_following_${user.email}`) || '[]'
      );
      const updated = followingData.filter((email) => email !== sellerEmail);
      localStorage.setItem(`marketplace_following_${user.email}`, JSON.stringify(updated));
      loadFollowing();
    } catch (error) {
      console.error('Error unfollowing:', error);
      showError('Failed to unfollow seller');
    }
  };

  const handleViewListing = (listingId) => {
    navigate(`/marketplace/listing/${listingId}`);
  };

  const handleViewAllListings = (sellerEmail) => {
    // Navigate to marketplace with seller filter (you can implement this filter)
    navigate(`/marketplace?seller=${encodeURIComponent(sellerEmail)}`);
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
            <span className="font-paragraph text-sm">Back to Buyer Dashboard</span>
          </button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="font-heading text-2xl text-dark-brown mb-2">Marketplace Following</h1>
            <p className="text-sm text-gray-500">
              Sellers and products you're following
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading following list...</p>
            </div>
          ) : following.length === 0 ? (
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
              <h3 className="font-heading text-lg text-dark-brown mb-2">Not following anyone yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Follow sellers to see their latest listings
              </p>
              <button
                onClick={() => navigate('/marketplace')}
                className="px-6 py-2.5 text-sm font-paragraph rounded-lg bg-accent-red text-white hover:bg-accent-red/90 transition-colors"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {following.map((seller) => (
                <div
                  key={seller.email}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                >
                  {/* Seller Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dark-brown to-accent-red flex items-center justify-center text-white text-lg font-semibold">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-heading text-lg text-dark-brown">{seller.name}</h3>
                        <p className="text-sm text-gray-500">{seller.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {seller.listingsCount} {seller.listingsCount === 1 ? 'listing' : 'listings'}
                      </span>
                      <button
                        onClick={() => handleUnfollow(seller.email)}
                        className="px-4 py-2 text-sm font-paragraph rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>

                  {/* Seller Listings Preview */}
                  {seller.listings.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-heading text-md text-dark-brown">Recent Listings</h4>
                        {seller.listingsCount > 3 && (
                          <button
                            onClick={() => handleViewAllListings(seller.email)}
                            className="text-sm text-accent-red hover:underline"
                          >
                            View all {seller.listingsCount} listings →
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {seller.listings.map((listing) => (
                          <div
                            key={listing.id}
                            onClick={() => handleViewListing(listing.id)}
                            className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                          >
                            {listing.imagePreview || listing.image ? (
                              <img
                                src={listing.imagePreview || listing.image}
                                alt={listing.title}
                                className="w-full h-32 object-cover"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                                <svg
                                  className="w-8 h-8 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                            <div className="p-3">
                              <h5 className="font-medium text-sm text-dark-brown line-clamp-1 mb-1">
                                {listing.title}
                              </h5>
                              <p className="text-sm font-semibold text-dark-brown">
                                ₹{parseFloat(listing.price).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No active listings from this seller
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

