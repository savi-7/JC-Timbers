import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';

export default function LocationSettings() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: 20.5937, lon: 78.9629 }); // Default: India center
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadLocation();
    }
  }, [isAuthenticated, user]);

  const loadLocation = () => {
    try {
      const savedLocation = localStorage.getItem(`buyer_location_${user.email}`);
      if (savedLocation) {
        const locationData = JSON.parse(savedLocation);
        setLocation(locationData.address || '');
        if (locationData.lat && locationData.lon) {
          setMapCoords({ lat: locationData.lat, lon: locationData.lon });
        }
      }
    } catch (error) {
      console.error('Error loading location:', error);
    }
  };

  const searchLocation = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Use Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`,
        {
          headers: {
            'User-Agent': 'JC-Timbers-Marketplace/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(value);
    }, 500);
  };

  const handleSelectLocation = (result) => {
    const address = result.display_name;
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    setLocation(address);
    setMapCoords({ lat, lon });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!location.trim()) {
      showError('Please select a location');
      return;
    }

    setIsSaving(true);
    try {
      const locationData = {
        address: location,
        lat: mapCoords.lat,
        lon: mapCoords.lon,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        `buyer_location_${user.email}`,
        JSON.stringify(locationData)
      );

      showSuccess('Location preference saved successfully!');
    } catch (error) {
      console.error('Error saving location:', error);
      showError('Failed to save location');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (!window.confirm('Are you sure you want to clear your location preference?')) {
      return;
    }

    try {
      localStorage.removeItem(`buyer_location_${user.email}`);
      setLocation('');
      setSearchQuery('');
      setMapCoords({ lat: 20.5937, lon: 78.9629 });
      showSuccess('Location preference cleared');
    } catch (error) {
      console.error('Error clearing location:', error);
      showError('Failed to clear location');
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
          <div className="mb-6">
            <h1 className="font-heading text-2xl text-dark-brown mb-2">Location Preference</h1>
            <p className="text-sm text-gray-500">
              Set your location to see products from your preferred area
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Location Search */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-heading text-lg text-dark-brown mb-4">Search Location</h2>
                
                {/* Search Input */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search for a city, area, or address..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/70 focus:border-accent-red"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg
                        className="animate-spin h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectLocation(result)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <p className="text-sm font-medium text-dark-brown mb-1">
                          {result.display_name.split(',')[0]}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {result.display_name}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Current Location */}
                {location && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Selected Location:</p>
                    <p className="text-sm font-medium text-dark-brown">{location}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={!location || isSaving}
                    className="flex-1 px-6 py-2.5 text-sm font-paragraph rounded-lg bg-accent-red text-white hover:bg-accent-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Location'}
                  </button>
                  {location && (
                    <button
                      onClick={handleClear}
                      className="px-6 py-2.5 text-sm font-paragraph rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      How it works
                    </p>
                    <p className="text-xs text-blue-700">
                      Setting your location preference will filter marketplace products to show only items from your selected area. You can change this anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Map */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-heading text-lg text-dark-brown mb-4">Map Preview</h2>
              
              <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon - 0.1},${mapCoords.lat - 0.1},${mapCoords.lon + 0.1},${mapCoords.lat + 0.1}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                  title="Location Map"
                  className="w-full h-full"
                />
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${mapCoords.lat}&mlon=${mapCoords.lon}&zoom=12`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent-red hover:underline font-medium"
                  >
                    View on OpenStreetMap →
                  </a>
                </div>
              </div>

              {location && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Coordinates:</p>
                  <p className="text-sm font-mono text-gray-700">
                    {mapCoords.lat.toFixed(6)}, {mapCoords.lon.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

