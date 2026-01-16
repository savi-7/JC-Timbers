import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';

export default function SellerLocation() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadListings();
    }
  }, [isAuthenticated, user]);

  const loadListings = () => {
    try {
      const storageKey = `marketplace_listings_${user?.email}`;
      const savedListings = localStorage.getItem(storageKey);
      
      if (savedListings) {
        const parsedListings = JSON.parse(savedListings);
        setListings(parsedListings);
      } else {
        setListings([]);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationCoords = (location) => {
    // Try to get coordinates from seller profile first
    try {
      const sellerData = localStorage.getItem(`seller_dashboard_${user.email}`);
      if (sellerData) {
        const data = JSON.parse(sellerData);
        if (data.locationCoords) {
          return data.locationCoords;
        }
      }
    } catch (error) {
      console.error('Error getting location coords:', error);
    }
    
    // Default coordinates (India center)
    return { lat: 20.5937, lon: 78.9629 };
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
            <h1 className="font-heading text-2xl text-dark-brown mb-2">Listing Locations</h1>
            <p className="text-sm text-gray-500">
              Locations of your listed products
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading listings...</p>
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="font-heading text-lg text-dark-brown mb-2">No listings yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create listings to see their locations on the map
              </p>
              <button
                onClick={() => navigate('/marketplace/create-listing')}
                className="px-6 py-2.5 text-sm font-paragraph rounded-lg bg-accent-red text-white hover:bg-accent-red/90 transition-colors"
              >
                Create Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Listings */}
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => setSelectedListing(listing)}
                    className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all ${
                      selectedListing?.id === listing.id
                        ? 'border-accent-red shadow-md'
                        : 'border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <h3 className="font-heading text-lg text-dark-brown mb-2 line-clamp-1">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{listing.category}</p>
                    {listing.location && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
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
                ))}
              </div>

              {/* Map */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-heading text-lg text-dark-brown mb-4">Location Map</h2>
                {selectedListing && selectedListing.location ? (
                  <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${getLocationCoords(selectedListing.location).lon - 0.1},${getLocationCoords(selectedListing.location).lat - 0.1},${getLocationCoords(selectedListing.location).lon + 0.1},${getLocationCoords(selectedListing.location).lat + 0.1}&layer=mapnik&marker=${getLocationCoords(selectedListing.location).lat},${getLocationCoords(selectedListing.location).lon}`}
                      title="Location Map"
                      className="w-full h-full"
                    />
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${getLocationCoords(selectedListing.location).lat}&mlon=${getLocationCoords(selectedListing.location).lon}&zoom=12`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent-red hover:underline font-medium"
                      >
                        View on OpenStreetMap →
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-96 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">Select a listing to view its location</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

