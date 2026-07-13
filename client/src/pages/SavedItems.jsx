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

export default function SavedItems() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { showError } = useNotification();
  const [savedItems, setSavedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSavedItems();
    }
  }, [isAuthenticated, user]);

  const loadSavedItems = () => {
    try {
      // Get saved item IDs from localStorage
      const savedIds = JSON.parse(
        localStorage.getItem(`saved_items_${user.email}`) || '[]'
      );

      if (savedIds.length === 0) {
        setSavedItems([]);
        setIsLoading(false);
        return;
      }

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

      // Filter to only saved items
      const saved = allListings.filter((listing) => 
        savedIds.includes(listing.id) && listing.status === 'active'
      );

      setSavedItems(saved);
    } catch (error) {
      console.error('Error loading saved items:', error);
      setSavedItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSaved = (listingId) => {
    try {
      const savedIds = JSON.parse(
        localStorage.getItem(`saved_items_${user.email}`) || '[]'
      );
      const updated = savedIds.filter((id) => id !== listingId);
      localStorage.setItem(`saved_items_${user.email}`, JSON.stringify(updated));
      loadSavedItems();
    } catch (error) {
      console.error('Error removing saved item:', error);
      showError('Failed to remove item');
    }
  };

  const handleViewListing = (listingId) => {
    navigate(`/marketplace/listing/${listingId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
            <h1 className="font-heading text-2xl text-dark-brown mb-2">Saved Items</h1>
            <p className="text-sm text-gray-500">
              Items you've saved from the marketplace
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading saved items...</p>
            </div>
          ) : savedItems.length === 0 ? (
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="font-heading text-lg text-dark-brown mb-2">No saved items yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Start saving items you're interested in from the marketplace
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
                  {savedItems.length} {savedItems.length === 1 ? 'Saved Item' : 'Saved Items'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedItems.map((listing) => (
                  <SavedItemCard
                    key={listing.id}
                    listing={listing}
                    onView={handleViewListing}
                    onRemove={() => handleRemoveSaved(listing.id)}
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

function SavedItemCard({ listing, onView, onRemove, formatDate }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md relative group">
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
        title="Remove from saved"
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
          <p className="text-xs text-gray-400">
            Listed {formatDate(listing.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

