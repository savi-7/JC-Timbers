import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNotification } from './NotificationProvider';

export default function LocationFilterModal({ isOpen, onClose, onLocationSelect, currentLocation }) {
  const { showError } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [location, setLocation] = useState(currentLocation?.address || '');
  const [mapCoords, setMapCoords] = useState(
    currentLocation?.lat && currentLocation?.lon
      ? { lat: currentLocation.lat, lon: currentLocation.lon }
      : { lat: 20.5937, lon: 78.9629 }
  );
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Reset location when modal opens/closes or currentLocation changes
  useEffect(() => {
    if (isOpen) {
      if (currentLocation?.address) {
        setLocation(currentLocation.address);
        if (currentLocation.lat && currentLocation.lon) {
          setMapCoords({ lat: currentLocation.lat, lon: currentLocation.lon });
        }
      } else {
        setLocation('');
        setMapCoords({ lat: 20.5937, lon: 78.9629 });
      }
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen, currentLocation]);

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
        setLocation(data.display_name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setLocation(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

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

    setLocation(address);
    setMapCoords({ lat, lon });
    setSearchQuery('');
    setSearchResults([]);

    // Update map marker position
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
      mapRef.current.setView([lat, lon], 12);
    }
  };

  // Initialize interactive map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let mapInitialized = false;

    const loadLeaflet = () => {
      return new Promise((resolve, reject) => {
        if (window.L) {
          resolve();
          return;
        }

        const existingCSS = document.querySelector('link[href*="leaflet.css"]');
        if (!existingCSS) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        const existingScript = document.querySelector('script[src*="leaflet.js"]');
        if (existingScript) {
          existingScript.onload = resolve;
          existingScript.onerror = reject;
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => {
          setTimeout(resolve, 100);
        };
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    loadLeaflet()
      .then(() => {
        if (!window.L || !mapContainerRef.current || mapInitialized) return;

        if (mapContainerRef.current.offsetHeight === 0) {
          console.error('Map container has no height');
          return;
        }

        const map = window.L.map(mapContainerRef.current, {
          center: [mapCoords.lat, mapCoords.lon],
          zoom: 10,
        });

        delete window.L.Icon.Default.prototype._getIconUrl;
        window.L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const marker = window.L.marker([mapCoords.lat, mapCoords.lon], {
          draggable: true,
        }).addTo(map);

        markerRef.current = marker;
        mapRef.current = map;
        mapInitialized = true;

        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          setMapCoords({ lat, lon: lng });
          marker.setLatLng([lat, lng]);
          await reverseGeocode(lat, lng);
        });

        marker.on('dragend', async (e) => {
          const { lat, lng } = e.target.getLatLng();
          setMapCoords({ lat, lon: lng });
          await reverseGeocode(lat, lng);
        });

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
  }, [isOpen, reverseGeocode]);

  // Update map when mapCoords change (from search selection)
  useEffect(() => {
    if (mapRef.current && markerRef.current && isOpen) {
      markerRef.current.setLatLng([mapCoords.lat, mapCoords.lon]);
      mapRef.current.setView([mapCoords.lat, mapCoords.lon], 12);
    }
  }, [mapCoords, isOpen]);

  const handleApply = () => {
    if (!location.trim()) {
      showError('Please select a location');
      return;
    }

    onLocationSelect({
      address: location,
      lat: mapCoords.lat,
      lon: mapCoords.lon,
    });
    onClose();
  };

  const handleClear = () => {
    setLocation('');
    setMapCoords({ lat: 20.5937, lon: 78.9629 });
    setSearchQuery('');
    setSearchResults([]);
    onLocationSelect(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="font-heading text-xl text-dark-brown">Filter by Location</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a location to see products from that area
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Search */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-brown mb-2">
                  Search Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search for a city, area, or address..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/70 focus:border-accent-red"
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
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
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

              {/* Selected Location */}
              {location && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Selected Location:</p>
                  <p className="text-sm font-medium text-dark-brown">{location}</p>
                  {isReverseGeocoding && (
                    <p className="text-xs text-gray-400 mt-1">Updating address...</p>
                  )}
                </div>
              )}

              {/* Instructions */}
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
                      How to use
                    </p>
                    <p className="text-xs text-blue-700">
                      Search for a location or click/drag the marker on the map to select your desired area. Products from that location will be shown in the marketplace.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Map */}
            <div>
              <label className="block text-sm font-medium text-dark-brown mb-2">
                Map
              </label>
              <div
                ref={mapContainerRef}
                className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                style={{ minHeight: '384px' }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClear}
            className="px-6 py-2.5 text-sm font-paragraph rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Clear Filter
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-paragraph rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!location.trim()}
              className="px-6 py-2.5 text-sm font-paragraph rounded-lg bg-accent-red text-white hover:bg-accent-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
