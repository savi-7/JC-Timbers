import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';

export default function EnableSellerDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: 20.5937, lon: 78.9629 });
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Pre-fill with user data
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        location: '',
      });
    }
  }, [isAuthenticated, user]);

  const reverseGeocode = useCallback(async (lat, lon) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'JC-Timbers-Marketplace/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      if (data.display_name) {
        setFormData((prev) => ({ ...prev, location: data.display_name }));
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Set a basic location string if reverse geocoding fails
      setFormData((prev) => ({
        ...prev,
        location: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      }));
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // Initialize interactive map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let mapInitialized = false;

    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.L) {
          resolve();
          return;
        }

        // Check if CSS is already loaded
        const existingCSS = document.querySelector('link[href*="leaflet.css"]');
        if (!existingCSS) {
          // Load CSS first
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Check if script is already loading
        const existingScript = document.querySelector('script[src*="leaflet.js"]');
        if (existingScript) {
          existingScript.onload = resolve;
          existingScript.onerror = reject;
          return;
        }

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => {
          // Wait a bit for CSS to be fully applied
          setTimeout(resolve, 100);
        };
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    loadLeaflet()
      .then(() => {
        if (!window.L || !mapContainerRef.current || mapInitialized) return;

        // Ensure container has dimensions
        if (mapContainerRef.current.offsetHeight === 0) {
          console.error('Map container has no height');
          return;
        }

        // Initialize map
        const map = window.L.map(mapContainerRef.current, {
          center: [mapCoords.lat, mapCoords.lon],
          zoom: 10,
        });

        // Fix default marker icon issue
        delete window.L.Icon.Default.prototype._getIconUrl;
        window.L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add initial marker
        const marker = window.L.marker([mapCoords.lat, mapCoords.lon], {
          draggable: true,
        }).addTo(map);

        markerRef.current = marker;
        mapRef.current = map;
        mapInitialized = true;

        // Handle map click
        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          setMapCoords({ lat, lon: lng });
          marker.setLatLng([lat, lng]);
          await reverseGeocode(lat, lng);
        });

        // Handle marker drag
        marker.on('dragend', async (e) => {
          const { lat, lng } = e.target.getLatLng();
          setMapCoords({ lat, lon: lng });
          await reverseGeocode(lat, lng);
        });

        // Force map to invalidate size after a short delay
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
          }
        }, 200);
      })
      .catch((error) => {
        console.error('Error loading Leaflet:', error);
      });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [reverseGeocode]);

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([mapCoords.lat, mapCoords.lon]);
      mapRef.current.setView([mapCoords.lat, mapCoords.lon], mapRef.current.getZoom());
    }
  }, [mapCoords]);

  const searchLocation = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
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

    setFormData((prev) => ({ ...prev, location: address }));
    setMapCoords({ lat, lon });
    setSearchQuery('');
    setSearchResults([]);

    // Update map if it exists
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lon], 13);
      markerRef.current.setLatLng([lat, lon]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Save seller details
      const sellerData = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ''), // Remove non-digits
        location: formData.location,
        locationCoords: mapCoords,
        enabledAt: new Date().toISOString(),
        isEnabled: true,
      };

      localStorage.setItem(
        `seller_dashboard_${user.email}`,
        JSON.stringify(sellerData)
      );

      showSuccess('Seller dashboard enabled successfully!');
      navigate('/marketplace/create-listing');
    } catch (error) {
      console.error('Error enabling seller dashboard:', error);
      showError('Failed to enable seller dashboard. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          onSellClick={() => {}}
        />

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h1 className="font-heading text-2xl text-dark-brown mb-2">
              Enable Seller Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Complete your seller profile to start listing products on the marketplace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your 10-digit phone number"
                maxLength="10"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.phone
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              
              {/* Search Input */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search for a city, area, or address..."
                  className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.location
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                  }`}
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
                      type="button"
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

              {/* Interactive Map */}
              <div className="mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
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
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        Interactive Map
                      </p>
                      <p className="text-xs text-blue-700">
                        Click anywhere on the map or drag the marker to set your location. You can also search for a location above.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div
                    ref={mapContainerRef}
                    id="seller-location-map"
                    className="w-full h-96 rounded-lg border border-gray-200 bg-gray-100"
                    style={{ 
                      minHeight: '384px',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    {/* Loading indicator */}
                    {!mapRef.current && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <div className="text-center">
                          <svg
                            className="animate-spin h-8 w-8 text-accent-red mx-auto mb-2"
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
                          <p className="text-sm text-gray-600">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isReverseGeocoding && (
                    <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-accent-red"
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
                      <span className="text-xs text-gray-700 font-medium">Getting address...</span>
                    </div>
                  )}
                </div>
                
                {/* Leaflet CSS fix - ensure tiles display correctly */}
                <style>{`
                  #seller-location-map .leaflet-container {
                    height: 100% !important;
                    width: 100% !important;
                    z-index: 0;
                  }
                  #seller-location-map .leaflet-tile-container img {
                    max-width: none !important;
                  }
                `}</style>
              </div>

              {/* Selected Location Display */}
              {formData.location && (
                <div className="bg-gray-50 rounded-lg p-4 mt-3">
                  <p className="text-xs text-gray-500 mb-1">Selected Location:</p>
                  <p className="text-sm font-medium text-dark-brown">{formData.location}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coordinates: {mapCoords.lat.toFixed(6)}, {mapCoords.lon.toFixed(6)}
                  </p>
                </div>
              )}

              {errors.location && (
                <p className="mt-1 text-xs text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-paragraph rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-paragraph rounded-lg bg-accent-red text-white hover:bg-accent-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Enabling...' : 'Enable Seller Dashboard'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

