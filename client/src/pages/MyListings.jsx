import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';

const CONDITION_LABELS = {
  'new': 'New',
  'used-like-new': 'Used - Like New',
  'used-good': 'Used - Good',
  'fair': 'Fair',
};

export default function MyListings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Load listings (for now from localStorage, later from API)
  // Reload when component mounts or when location changes (navigation)
  useEffect(() => {
    if (isAuthenticated && user) {
      loadListings();
    }
  }, [isAuthenticated, user, location.key]);

  const loadListings = () => {
    try {
      // TODO: Replace with API call
      // For now, get from localStorage
      const storageKey = `marketplace_listings_${user?.email}`;
      console.log('Loading listings for user:', user?.email);
      console.log('Storage key:', storageKey);
      
      const savedListings = localStorage.getItem(storageKey);
      console.log('Raw localStorage data:', savedListings);
      
      if (savedListings) {
        const parsedListings = JSON.parse(savedListings);
        console.log('Parsed listings:', parsedListings);
        setListings(parsedListings);
      } else {
        console.log('No listings found in localStorage');
        setListings([]);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (listingId) => {
    navigate(`/marketplace/edit-listing/${listingId}`);
  };

  const handleDelete = async (listingId) => {
    if (deleteConfirmId !== listingId) {
      setDeleteConfirmId(listingId);
      return;
    }

    try {
      // TODO: Replace with API call
      const updatedListings = listings.filter((listing) => listing.id !== listingId);
      localStorage.setItem(`marketplace_listings_${user?.email}`, JSON.stringify(updatedListings));
      setListings(updatedListings);
      setDeleteConfirmId(null);
      alert('Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. Please try again.');
    }
  };

  const handleMarkAsSold = async (listingId) => {
    try {
      // TODO: Replace with API call
      const updatedListings = listings.map((listing) =>
        listing.id === listingId ? { ...listing, status: 'sold', soldAt: new Date().toISOString() } : listing
      );
      localStorage.setItem(`marketplace_listings_${user?.email}`, JSON.stringify(updatedListings));
      setListings(updatedListings);
      alert('Listing marked as sold');
    } catch (error) {
      console.error('Error marking listing as sold:', error);
      alert('Failed to update listing. Please try again.');
    }
  };

  const handleUnmarkAsSold = async (listingId) => {
    try {
      // TODO: Replace with API call
      const updatedListings = listings.map((listing) =>
        listing.id === listingId ? { ...listing, status: 'active', soldAt: null } : listing
      );
      localStorage.setItem(`marketplace_listings_${user?.email}`, JSON.stringify(updatedListings));
      setListings(updatedListings);
      alert('Listing reactivated');
    } catch (error) {
      console.error('Error reactivating listing:', error);
      alert('Failed to update listing. Please try again.');
    }
  };

  // Show nothing while checking authentication
  if (loading || !isAuthenticated) {
    return null;
  }

  const activeListings = listings.filter((listing) => listing.status !== 'sold');
  const soldListings = listings.filter((listing) => listing.status === 'sold');

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="bg-white">
        <MarketplaceHeader
          userName={user?.name}
          userEmail={user?.email}
          onSearchChange={(value) => {
            console.log('Marketplace search:', value);
          }}
          onCategorySelect={(category) => {
            console.log('Marketplace category:', category);
          }}
          onSellClick={() => {
            console.log('Sell clicked');
          }}
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl text-dark-brown mb-2">My Listings</h1>
              <p className="text-sm text-gray-500">
                Manage your marketplace listings
              </p>
            </div>
            <button
              onClick={() => navigate('/marketplace/create-listing')}
              className="inline-flex items-center gap-2 rounded-full bg-accent-red text-white px-4 py-2 text-sm font-paragraph shadow-sm hover:bg-accent-red/90 transition-colors"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10">
                +
              </span>
              <span>Create New Listing</span>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading your listings...</p>
            </div>
          ) : listings.length === 0 ? (
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="font-heading text-lg text-dark-brown mb-2">No listings yet</h3>
              <p className="text-sm text-gray-500 mb-6">
                Start selling by creating your first listing
              </p>
              <button
                onClick={() => navigate('/marketplace/create-listing')}
                className="inline-flex items-center gap-2 rounded-full bg-dark-brown text-white px-6 py-2.5 text-sm font-paragraph hover:bg-dark-brown/90 transition-colors"
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Active Listings */}
              {activeListings.length > 0 && (
                <div>
                  <h2 className="font-heading text-xl text-dark-brown mb-4">
                    Active Listings ({activeListings.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onMarkAsSold={handleMarkAsSold}
                        deleteConfirmId={deleteConfirmId}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sold Listings */}
              {soldListings.length > 0 && (
                <div>
                  <h2 className="font-heading text-xl text-dark-brown mb-4">
                    Sold Items ({soldListings.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {soldListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onUnmarkAsSold={handleUnmarkAsSold}
                        deleteConfirmId={deleteConfirmId}
                        isSold={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ListingCard({
  listing,
  onEdit,
  onDelete,
  onMarkAsSold,
  onUnmarkAsSold,
  deleteConfirmId,
  isSold = false,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-shadow hover:shadow-md ${
      isSold ? 'opacity-75 border-gray-300' : 'border-gray-200'
    }`}>
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
        {isSold && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Sold
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
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
          {listing.description}
        </p>
        {listing.location && (
          <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
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
        <p className="text-xs text-gray-400 mb-4">
          Listed on {formatDate(listing.createdAt)}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          {!isSold ? (
            <>
              <button
                onClick={() => onEdit(listing.id)}
                className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onMarkAsSold(listing.id)}
                className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
              >
                Mark Sold
              </button>
              <button
                onClick={() => onDelete(listing.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  deleteConfirmId === listing.id
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'border border-red-300 text-red-700 hover:bg-red-50'
                }`}
              >
                {deleteConfirmId === listing.id ? 'Confirm' : 'Delete'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onUnmarkAsSold(listing.id)}
                className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
              >
                Reactivate
              </button>
              <button
                onClick={() => onDelete(listing.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  deleteConfirmId === listing.id
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'border border-red-300 text-red-700 hover:bg-red-50'
                }`}
              >
                {deleteConfirmId === listing.id ? 'Confirm' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

