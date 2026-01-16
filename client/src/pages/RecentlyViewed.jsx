import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';

const CONDITION_LABELS = {
  'new': 'New',
  'used-like-new': 'Used - Like New',
  'used-good': 'Used - Good',
  'fair': 'Fair',
};

export default function RecentlyViewed() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { showError } = useNotification();
  const [recentItems, setRecentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadRecentlyViewed();
    }
  }, [isAuthenticated, user]);

  const loadRecentlyViewed = () => {
    try {
      // Get recently viewed items from localStorage
      const recentData = JSON.parse(
        localStorage.getItem(`recently_viewed_${user.email}`) || '[]'
      );

      if (recentData.length === 0) {
        setRecentItems([]);
        setIsLoading(false);
        return;
      }

      // Sort by most recent first
      const sorted = recentData.sort((a, b) => 
        new Date(b.viewedAt) - new Date(a.viewedAt)
      );

      // Get all listings from all users
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

      // Map recently viewed IDs to full listing data
      const viewed = sorted
        .map((item) => {
          const listing = allListings.find((l) => l.id === item.listingId);
          if (listing && listing.status === 'active') {
            return {
              ...listing,
              viewedAt: item.viewedAt,
            };
          }
          return null;
        })
        .filter(Boolean);

      setRecentItems(viewed);
    } catch (error) {
      console.error('Error loading recently viewed:', error);
      setRecentItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    if (!window.confirm('Are you sure you want to clear all recently viewed items?')) {
      return;
    }

    try {
      localStorage.removeItem(`recently_viewed_${user.email}`);
      setRecentItems([]);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
      showError('Failed to clear recently viewed items');
    }
  };

  const handleRemoveItem = (listingId) => {
    try {
      const recentData = JSON.parse(
        localStorage.getItem(`recently_viewed_${user.email}`) || '[]'
      );
      const updated = recentData.filter((item) => item.listingId !== listingId);
      localStorage.setItem(`recently_viewed_${user.email}`, JSON.stringify(updated));
      loadRecentlyViewed();
    } catch (error) {
      console.error('Error removing item:', error);
      showError('Failed to remove item');
    }
  };

  const handleViewListing = (listingId) => {
    navigate(`/marketplace/listing/${listingId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
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
            <span className="font-paragraph text-sm">Back to Buyer Dashboard</span>
          </button>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl text-dark-brown mb-2">Recently Viewed</h1>
              <p className="text-sm text-gray-500">
                Items you've recently viewed on the marketplace
              </p>
            </div>
            {recentItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm font-paragraph rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading recently viewed items...</p>
            </div>
          ) : recentItems.length === 0 ? (
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-heading text-lg text-dark-brown mb-2">No recently viewed items</h3>
              <p className="text-sm text-gray-500 mb-4">
                Items you view will appear here
              </p>
              <button
                onClick={() => navigate('/marketplace')}
                className="px-6 py-2.5 text-sm font-paragraph rounded-lg bg-accent-red text-white hover:bg-accent-red/90 transition-colors"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl text-dark-brown">
                  {recentItems.length} {recentItems.length === 1 ? 'Item' : 'Items'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recentItems.map((listing) => (
                  <RecentlyViewedCard
                    key={listing.id}
                    listing={listing}
                    onView={handleViewListing}
                    onRemove={() => handleRemoveItem(listing.id)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function RecentlyViewedCard({ listing, onView, onRemove, formatDate }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md relative group">
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
        title="Remove from recently viewed"
      >
        <svg
          className="w-4 h-4 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        className="cursor-pointer"
        onClick={() => onView(listing.id)}
      >
        {/* Image */}
        <div className="relative h-48 bg-gray-100">
          {listing.imagePreview || listing.image ? (
            <img
              src={listing.imagePreview || listing.image}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-12 h-12"
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
          {listing.condition && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-700">
              {CONDITION_LABELS[listing.condition] || listing.condition}
            </div>
          )}
          {/* Viewed timestamp badge */}
          {listing.viewedAt && (
            <div className="absolute bottom-2 left-2 bg-blue-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white">
              {formatDate(listing.viewedAt)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-heading text-lg text-dark-brown mb-1 line-clamp-2">
            {listing.title}
          </h3>
          <p className="text-sm text-gray-500 mb-2">{listing.category}</p>
          <p className="text-xl font-semibold text-dark-brown mb-3">
            ₹{parseFloat(listing.price).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {listing.description}
          </p>
          {listing.location && (
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {listing.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

