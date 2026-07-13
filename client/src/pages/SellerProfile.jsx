import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';

export default function SellerProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [sellerData, setSellerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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
  const [mapLoading, setMapLoading] = useState(true);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const mapInitializedRef = useRef(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSellerData();
    }
  }, [isAuthenticated, user]);

  const loadSellerData = () => {
    try {
      const data = localStorage.getItem(`seller_dashboard_${user.email}`);
      if (data) {
        const parsed = JSON.parse(data);
        setSellerData(parsed);
        // Split name into first and last name
        const nameParts = (parsed.name || '').trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        // Pre-fill form data
        setFormData({
          firstName: firstName,
          lastName: lastName,
          email: parsed.email || '',
          phone: parsed.phone || '',
          location: parsed.location || '',
        });
        if (parsed.locationCoords) {
          setMapCoords(parsed.locationCoords);
        }
      }
    } catch (error) {
      console.error('Error loading seller data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMapLoading(true);
    mapInitializedRef.current = false;
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original seller data
    if (sellerData) {
      const nameParts = (sellerData.name || '').trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      setFormData({
        firstName: firstName,
        lastName: lastName,
        email: sellerData.email || '',
        phone: sellerData.phone || '',
        location: sellerData.location || '',
      });
      if (sellerData.locationCoords) {
        setMapCoords(sellerData.locationCoords);
      }
    }
    setErrors({});
  };

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
      setFormData((prev) => ({
        ...prev,
        location: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      }));
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // Initialize interactive map (only when editing)
  useEffect(() => {
    if (!isEditing || !mapContainerRef.current) return;

    // Reset state
    setMapLoading(true);
    mapInitializedRef.current = false;

    let mapInitialized = false;

    // Load Leaflet CSS and JS dynamically
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
        if (existingScript && !window.L) {
          existingScript.onload = () => setTimeout(resolve, 200);
          existingScript.onerror = reject;
          return;
        }

        if (existingScript && window.L) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => setTimeout(resolve, 200);
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    loadLeaflet()
      .then(() => {
        if (!window.L || !mapContainerRef.current || mapInitialized || mapInitializedRef.current) {
          setMapLoading(false);
          return;
        }

        const initMap = (attempts = 0) => {
          if (!mapContainerRef.current) {
            setMapLoading(false);
            return;
          }

          const hasDimensions = 
            mapContainerRef.current.offsetHeight > 0 || 
            mapContainerRef.current.offsetWidth > 0 ||
            mapContainerRef.current.clientHeight > 0;

          if (!hasDimensions && attempts < 30) {
            setTimeout(() => initMap(attempts + 1), 200);
            return;
          }

          if (!hasDimensions) {
            setMapLoading(false);
            return;
          }

          try {
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
            mapInitializedRef.current = true;
            setMapLoading(false);

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
                map.setView([mapCoords.lat, mapCoords.lon], 13);
              }
            }, 500);
          } catch (error) {
            console.error('Error initializing map:', error);
            setMapLoading(false);
          }
        };

        setTimeout(() => initMap(0), 100);
      })
      .catch((error) => {
        console.error('Error loading Leaflet:', error);
        setMapLoading(false);
      });

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {
          // Ignore errors during cleanup
        }
        mapRef.current = null;
        markerRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, [isEditing, reverseGeocode, mapCoords.lat, mapCoords.lon]);

  // Update map when coordinates change
  useEffect(() => {
    if (markerRef.current && mapRef.current && isEditing) {
      const currentZoom = mapRef.current.getZoom() || 13;
      markerRef.current.setLatLng([mapCoords.lat, mapCoords.lon]);
      mapRef.current.setView([mapCoords.lat, mapCoords.lon], currentZoom > 12 ? currentZoom : 13, {
        animate: true,
        duration: 0.5,
      });
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);
    }
  }, [mapCoords.lat, mapCoords.lon, isEditing]);

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

    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lon], 13);
      markerRef.current.setLatLng([lat, lon]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For firstName and lastName, only allow alphabets and spaces
    if (name === 'firstName' || name === 'lastName') {
      // Remove any non-alphabetic characters (except spaces)
      const cleanedValue = value.replace(/[^A-Za-z\s]/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: cleanedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name validation - alphabet only
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[A-Za-z\s]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name must contain only alphabets';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation - alphabet only
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[A-Za-z\s]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name must contain only alphabets';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation - proper format
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address (e.g., example@domain.com)';
      }
    }

    // Phone number validation - 10 digits and proper format
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Remove all non-digit characters for validation
      const phoneDigits = formData.phone.replace(/\D/g, '');
      
      // Check if it's exactly 10 digits
      if (phoneDigits.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      } 
      // Check if it starts with valid Indian mobile number prefix (6-9)
      else if (!/^[6-9]/.test(phoneDigits)) {
        newErrors.phone = 'Phone number must start with 6, 7, 8, or 9';
      }
      // Check for proper format (should not have invalid patterns)
      else if (!/^[6-9][0-9]{9}$/.test(phoneDigits)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine first name and last name
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      
      // Update seller details
      const updatedSellerData = {
        ...sellerData,
        name: fullName,
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''), // Remove non-digits, keep only 10 digits
        location: formData.location.trim(),
        locationCoords: mapCoords,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        `seller_dashboard_${user.email}`,
        JSON.stringify(updatedSellerData)
      );

      setSellerData(updatedSellerData);
      setIsEditing(false);
      showSuccess('Seller profile updated successfully!');
    } catch (error) {
      console.error('Error updating seller profile:', error);
      showError('Failed to update seller profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !isAuthenticated || isLoading) {
    return null;
  }

  if (!sellerData) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="bg-white">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <h3 className="font-heading text-lg text-dark-brown mb-2">Seller Dashboard Not Enabled</h3>
              <p className="text-sm text-gray-500 mb-4">
                Please enable seller dashboard first
              </p>
              <button
                onClick={() => navigate('/marketplace/enable-seller')}
                className="px-6 py-2.5 text-sm font-paragraph rounded-lg bg-accent-red text-white hover:bg-accent-red/90 transition-colors"
              >
                Enable Seller Dashboard
              </button>
            </div>
          </section>
        </main>
      </div>
    );
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
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="font-heading text-2xl text-dark-brown mb-2">Seller Profile</h1>
              <p className="text-sm text-gray-500">
                Your seller information and details
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm font-paragraph rounded-lg bg-accent-red text-white hover:bg-accent-red/90 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Details */}
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      pattern="[A-Za-z\s]+"
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.firstName
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-medium text-dark-brown">
                    {sellerData.name ? sellerData.name.split(/\s+/)[0] : 'N/A'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      pattern="[A-Za-z\s]+"
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.lastName
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-medium text-dark-brown">
                    {sellerData.name ? sellerData.name.split(/\s+/).slice(1).join(' ') || 'N/A' : 'N/A'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@domain.com"
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.email
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-medium text-dark-brown">{sellerData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        // Only allow digits and format as user types
                        const value = e.target.value.replace(/\D/g, '');
                        // Limit to 10 digits
                        const formatted = value.slice(0, 10);
                        setFormData((prev) => ({ ...prev, phone: formatted }));
                        if (errors.phone) {
                          setErrors((prev) => ({ ...prev, phone: '' }));
                        }
                      }}
                      placeholder="9876543210"
                      maxLength="10"
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.phone
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                      }`}
                    />
                    {!errors.phone && formData.phone && (
                      <p className="mt-1 text-xs text-gray-500">
                        Format: 10 digits starting with 6, 7, 8, or 9
                      </p>
                    )}
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-medium text-dark-brown">{sellerData.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.location
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                      }`}
                    />
                    {errors.location && (
                      <p className="mt-1 text-xs text-red-600">{errors.location}</p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-medium text-dark-brown">{sellerData.location}</p>
                )}
              </div>
            </div>

            {/* Location Map */}
            {(sellerData.locationCoords || isEditing) && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Location Map
                </label>
                {isEditing ? (
                  <div>
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
                    <div className="relative">
                      <div
                        ref={mapContainerRef}
                        id="seller-profile-map"
                        className="w-full rounded-lg border border-gray-200 bg-gray-100 relative"
                        style={{ 
                          height: '384px',
                          minHeight: '384px',
                          width: '100%',
                          display: 'block',
                          visibility: 'visible',
                          position: 'relative',
                          zIndex: 0
                        }}
                      >
                        {mapLoading && (
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

                    {/* Leaflet CSS fix */}
                    <style>{`
                      #seller-profile-map .leaflet-container {
                        height: 100% !important;
                        width: 100% !important;
                        z-index: 0 !important;
                        position: relative !important;
                      }
                      #seller-profile-map .leaflet-tile-container img {
                        max-width: none !important;
                      }
                    `}</style>
                  </div>
                ) : (
                  <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${sellerData.locationCoords.lon - 0.1},${sellerData.locationCoords.lat - 0.1},${sellerData.locationCoords.lon + 0.1},${sellerData.locationCoords.lat + 0.1}&layer=mapnik&marker=${sellerData.locationCoords.lat},${sellerData.locationCoords.lon}`}
                      title="Location Map"
                      className="w-full h-full"
                    />
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${sellerData.locationCoords.lat}&mlon=${sellerData.locationCoords.lon}&zoom=12`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent-red hover:underline font-medium"
                      >
                        View on OpenStreetMap →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enabled Date */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Seller Dashboard Enabled
              </label>
              <p className="text-sm text-gray-600">
                {sellerData.enabledAt
                  ? new Date(sellerData.enabledAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
              {sellerData.updatedAt && (
                <>
                  <label className="block text-sm font-medium text-gray-500 mb-1 mt-3">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-600">
                    {new Date(sellerData.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-paragraph rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-paragraph rounded-lg bg-dark-brown text-white hover:bg-dark-brown/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}

