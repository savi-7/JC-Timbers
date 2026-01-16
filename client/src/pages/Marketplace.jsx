import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import LocationFilterModal from '../components/LocationFilterModal';
import { useAuth } from '../hooks/useAuth';

const CONDITION_LABELS = {
  'new': 'New',
  'used-like-new': 'Used - Like New',
  'used-good': 'Used - Good',
  'fair': 'Fair',
};

export default function Marketplace() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Load all listings from all users
  useEffect(() => {
    loadAllListings();
  }, []);

  // Filter listings based on search, category, and location
  useEffect(() => {
    // Show only active listings (not sold)
    let filtered = listings.filter((listing) => listing.status === 'active' || !listing.status);

    // Hide seller's own listings from marketplace view (only show other users' listings)
    if (isAuthenticated && user?.email) {
      filtered = filtered.filter((listing) => listing.userId !== user.email);
    }

    // Filter by selected location filter (priority over saved preference)
    if (selectedLocation?.address) {
      const filterLocation = selectedLocation.address.split(',')[0].toLowerCase().trim();
      filtered = filtered.filter((listing) => {
        if (!listing.location) return false;
        const listingLocation = listing.location.toLowerCase();
        return listingLocation.includes(filterLocation) || 
               filterLocation.includes(listingLocation.split(',')[0]);
      });
    } else if (isAuthenticated && user?.email) {
      // Fallback to saved location preference if no filter is selected
      try {
        const locationData = localStorage.getItem(`buyer_location_${user.email}`);
        if (locationData) {
          const location = JSON.parse(locationData);
          if (location.address) {
            const savedLocation = location.address.split(',')[0].toLowerCase().trim();
            filtered = filtered.filter((listing) => {
              if (!listing.location) return false;
              const listingLocation = listing.location.toLowerCase();
              return listingLocation.includes(savedLocation) || 
                     savedLocation.includes(listingLocation.split(',')[0]);
            });
          }
        }
      } catch (error) {
        console.error('Error filtering by location:', error);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title?.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query) ||
          listing.category?.toLowerCase().includes(query) ||
          listing.location?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(
        (listing) => listing.category === selectedCategory
      );
    }

    setFilteredListings(filtered);
  }, [listings, searchQuery, selectedCategory, selectedLocation, isAuthenticated, user]);

  const loadAllListings = () => {
    try {
      // Get all listings from localStorage (from all users)
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

      setListings(allListings);
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleViewListing = (listingId) => {
    navigate(`/marketplace/listing/${listingId}`);
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="bg-white">
        <MarketplaceHeader
          userName={user?.name}
          userEmail={user?.email}
          onSearchChange={handleSearchChange}
          onCategorySelect={handleCategorySelect}
          onLocationClick={() => setShowLocationModal(true)}
          selectedLocation={selectedLocation}
          onSellClick={() => {
            if (isAuthenticated) {
              navigate('/marketplace/create-listing');
            } else {
              navigate('/login');
            }
          }}
        />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading listings...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
              <h1 className="font-heading text-2xl text-dark-brown mb-2">
                {searchQuery || selectedCategory || selectedLocation ? 'No listings found' : 'No listings yet'}
              </h1>
              <p className="font-paragraph text-gray-600 max-w-xl mx-auto">
                {searchQuery || selectedCategory || selectedLocation
                  ? 'Try adjusting your search, category, or location filter'
                  : 'Be the first to list a furniture item for sale!'}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl text-dark-brown">
                  {filteredListings.length} {filteredListings.length === 1 ? 'Listing' : 'Listings'}
                  {selectedCategory && ` in ${selectedCategory}`}
                  {selectedLocation && ` near ${selectedLocation.address.split(',')[0]}`}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredListings.map((listing) => (
                  <PublicListingCard
                    key={listing.id}
                    listing={listing}
                    onView={handleViewListing}
                    isAuthenticated={isAuthenticated}
                    currentUserId={user?.email}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Location Filter Modal */}
      <LocationFilterModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelect={setSelectedLocation}
        currentLocation={selectedLocation}
      />
    </div>
  );
}

function PublicListingCard({ listing, onView, isAuthenticated, currentUserId }) {
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
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
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
        {listing.status === 'sold' && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
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
  );
}


