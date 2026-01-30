import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';

const DEFAULT_CATEGORIES = [
  'Sofa',
  'Study Table',
  'Dining Table',
  'Bed',
  'Wardrobe',
  'Chair',
  'Coffee Table',
  'TV Unit',
  'Bookshelf',
  'Custom Furniture',
];

const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'used-like-new', label: 'Used - Like New' },
  { value: 'used-good', label: 'Used - Good' },
  { value: 'fair', label: 'Fair' },
];

export default function CreateListing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    condition: '',
    description: '',
    location: '',
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: 20.5937, lon: 78.9629 });
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const mapInitializedRef = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Check if seller dashboard is enabled
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        const sellerData = localStorage.getItem(`seller_dashboard_${user.email}`);
        if (!sellerData) {
          // Seller dashboard not enabled, redirect to enable page
          navigate('/marketplace/enable-seller', { replace: true });
        } else {
          // Pre-fill location from seller profile if available
          const seller = JSON.parse(sellerData);
          if (seller.locationCoords) {
            setMapCoords(seller.locationCoords);
            if (seller.location) {
              setFormData((prev) => ({ ...prev, location: seller.location }));
            }
          }
        }
      } catch (error) {
        console.error('Error checking seller dashboard:', error);
      }
    }
  }, [isAuthenticated, user, navigate]);

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

  // Initialize interactive map
  useEffect(() => {
    // Wait for component to be fully mounted and visible
    const checkAndInit = () => {
      if (!mapContainerRef.current) {
        // Retry if container not ready (max 50 attempts = 5 seconds)
        let attempts = 0;
        const retry = setInterval(() => {
          attempts++;
          if (mapContainerRef.current || attempts >= 50) {
            clearInterval(retry);
            if (mapContainerRef.current) {
              initMapLogic();
            } else {
              console.error('Map container not found after retries');
              setMapLoading(false);
            }
          }
        }, 100);
        return;
      }

      // Check if container is visible
      const rect = mapContainerRef.current.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      
      if (!isVisible) {
        // Use Intersection Observer to wait for visibility
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0) {
                observer.disconnect();
                // Small delay to ensure container is fully rendered
                setTimeout(() => {
                  initMapLogic();
                }, 300);
              }
            });
          },
          { threshold: 0.1 }
        );

        if (mapContainerRef.current) {
          observer.observe(mapContainerRef.current);
        }

        // Fallback: if observer doesn't trigger, try after 2 seconds
        setTimeout(() => {
          observer.disconnect();
          if (mapContainerRef.current) {
            const rect = mapContainerRef.current.getBoundingClientRect();
            if (rect.width > 0 || rect.height > 0) {
              initMapLogic();
            }
          }
        }, 2000);

        return;
      }

      // Container is ready, proceed with initialization
      setTimeout(() => {
        initMapLogic();
      }, 100);
    };

    const initMapLogic = () => {
      if (!mapContainerRef.current) return;

      // Reset state
      setMapLoading(true);
      mapInitializedRef.current = false;

      let mapInitialized = false;

      // Load Leaflet CSS and JS dynamically
      const loadLeaflet = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.L) {
          console.log('Leaflet already loaded');
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
          console.log('Leaflet CSS loaded');
        }

        // Check if script is already loading
        const existingScript = document.querySelector('script[src*="leaflet.js"]');
        if (existingScript && !window.L) {
          // Script is loading, wait for it
          existingScript.onload = () => {
            console.log('Leaflet JS loaded from existing script');
            setTimeout(resolve, 200);
          };
          existingScript.onerror = reject;
          return;
        }

        if (existingScript && window.L) {
          // Already loaded
          resolve();
          return;
        }

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => {
          console.log('Leaflet JS loaded');
          // Wait a bit for CSS to be fully applied
          setTimeout(resolve, 200);
        };
        script.onerror = (error) => {
          console.error('Error loading Leaflet script:', error);
          reject(error);
        };
        document.body.appendChild(script);
      });
    };

    loadLeaflet()
      .then(() => {
        console.log('Leaflet loaded, initializing map...');
        
        if (!window.L) {
          console.error('Leaflet (window.L) is not available after loading');
          setMapLoading(false);
          setMapError('Failed to load map library. Please check your internet connection and refresh the page.');
          return;
        }

        if (!mapContainerRef.current) {
          console.error('Map container ref is not available');
          setMapLoading(false);
          setMapError('Map container not found. Please refresh the page.');
          return;
        }

        if (mapInitialized || mapInitializedRef.current) {
          console.log('Map already initialized');
          setMapLoading(false);
          return;
        }

        // Wait a bit for container to be ready, then initialize
        const initMap = (attempts = 0) => {
          // Ensure container has dimensions
          if (!mapContainerRef.current) {
            console.error('Map container ref lost during initialization');
            setMapLoading(false);
            return;
          }

          const hasDimensions = 
            mapContainerRef.current.offsetHeight > 0 || 
            mapContainerRef.current.offsetWidth > 0 ||
            mapContainerRef.current.clientHeight > 0;

          if (!hasDimensions && attempts < 30) {
            // Retry after a short delay (up to 30 times = 6 seconds)
            console.log(`Map container has no dimensions, retrying... (attempt ${attempts + 1})`);
            setTimeout(() => initMap(attempts + 1), 200);
            return;
          }

          if (!hasDimensions) {
            console.error('Map container still has no dimensions after retries');
            setMapLoading(false);
            setMapError('Map container is not visible. Please scroll to the location section.');
            return;
          }

          try {
            console.log('Initializing Leaflet map...', {
              container: mapContainerRef.current,
              dimensions: {
                height: mapContainerRef.current.offsetHeight,
                width: mapContainerRef.current.offsetWidth
              },
              coords: mapCoords
            });

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
            mapInitializedRef.current = true;
            setMapLoading(false);

            console.log('Map initialized successfully');

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
                map.setView([mapCoords.lat, mapCoords.lon], 13);
                console.log('Map size invalidated and view set');
              }
            }, 500);
          } catch (error) {
            console.error('Error initializing map:', error);
            setMapLoading(false);
            setMapError(`Error initializing map: ${error.message}. Please refresh the page.`);
          }
        };

        // Start initialization with a small delay
        setTimeout(() => initMap(0), 100);
      })
      .catch((error) => {
        console.error('Error loading Leaflet:', error);
        setMapLoading(false);
        setMapError('Failed to load map. Please refresh the page and try again.');
      });
    };

    // Start checking for container readiness
    checkAndInit();

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
  }, [reverseGeocode]);

  // Update map when coordinates change (e.g., from search selection)
  useEffect(() => {
    // Only update if map is already initialized
    if (markerRef.current && mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 13;
      // Update marker position
      markerRef.current.setLatLng([mapCoords.lat, mapCoords.lon]);
      // Pan map to new location
      mapRef.current.setView([mapCoords.lat, mapCoords.lon], currentZoom > 12 ? currentZoom : 13, {
        animate: true,
        duration: 0.5,
      });
      // Force invalidate size in case of layout changes
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);
    }
  }, [mapCoords.lat, mapCoords.lon]);

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

    // Update map and marker position with a slight delay to ensure map is ready
    setTimeout(() => {
      if (mapRef.current && markerRef.current) {
        mapRef.current.setView([lat, lon], 13);
        markerRef.current.setLatLng([lat, lon]);
        // Force map to invalidate size in case of layout issues
        mapRef.current.invalidateSize();
      }
    }, 100);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: '' }));
      }
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: 'Please upload a valid image file (JPEG, PNG, or WebP)',
      }));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        image: 'Image size must be less than 5MB',
      }));
      return;
    }

    // Set image and preview
    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Clear error
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    } else if (/^\d+$/.test(formData.title.trim())) {
      // Check if title contains only numbers
      newErrors.title = 'Title cannot contain only numbers. Please add text to your title.';
    }

    // Price validation
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Please enter a valid price greater than 0';
      } else if (priceNum >= 100000) {
        newErrors.price = 'Price must be less than ₹100,000';
      }
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    // Condition validation
    if (!formData.condition) {
      newErrors.condition = 'Please select a condition';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    }

    // Image validation
    if (!formData.image) {
      newErrors.image = 'Please upload an image of your product';
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
      // TODO: Replace with API call
      // For now, save to localStorage
      const saveListing = (imagePreviewData) => {
        // Create listing object without the File object (can't be serialized)
        // eslint-disable-next-line no-unused-vars
        const { image, ...listingData } = formData;
        const newListing = {
          id: Date.now().toString(),
          ...listingData,
          imagePreview: imagePreviewData || null,
          status: 'active',
          createdAt: new Date().toISOString(),
          userId: user?.email,
          locationCoords: mapCoords, // Save coordinates for map display
        };

        // Save to localStorage
        const storageKey = `marketplace_listings_${user?.email}`;
        const existingListings = JSON.parse(
          localStorage.getItem(storageKey) || '[]'
        );
        existingListings.push(newListing);
        localStorage.setItem(storageKey, JSON.stringify(existingListings));

        console.log('Listing saved:', newListing);
        console.log('All listings for user:', existingListings);

        // Show success message and redirect
        showSuccess('Listing created successfully!');
        navigate('/marketplace/my-listings');
      };

      if (formData.image) {
        const reader = new FileReader();
        reader.onloadend = () => {
          saveListing(reader.result);
        };
        reader.onerror = () => {
          console.error('Error reading image file');
          saveListing(null);
        };
        reader.readAsDataURL(formData.image);
      } else {
        // No image provided
        saveListing(null);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      showError('Failed to create listing. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/marketplace');
  };

  // Show nothing while checking authentication
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

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <button
            onClick={handleCancel}
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

          {/* Form Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h1 className="font-heading text-2xl text-dark-brown mb-2">
              Create a New Listing
            </h1>
            <p className="text-sm text-gray-500">
              Fill in the details below to list your furniture item for sale
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="E.g. Solid teak wood sofa set"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.title
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  max="99999.99"
                  step="0.01"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.price
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                  }`}
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-red-600">{errors.price}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.category
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                  }`}
                >
                  <option value="">Select a category</option>
                  {DEFAULT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-600">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.condition
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                }`}
              >
                <option value="">Select condition</option>
                {CONDITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p className="mt-1 text-xs text-red-600">{errors.condition}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                placeholder="Describe the condition, material, dimensions, and any custom details about your furniture..."
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors resize-none ${
                  errors.description
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                }`}
              />
              <div className="mt-1 flex justify-between items-center">
                {errors.description ? (
                  <p className="text-xs text-red-600">{errors.description}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/1000 characters
                  </p>
                )}
              </div>
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
                    id="listing-location-map"
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
                    {/* Loading indicator */}
                    {mapLoading && !mapError && (
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
                    
                    {/* Error message */}
                    {mapError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <div className="text-center p-4">
                          <svg
                            className="h-12 w-12 text-red-500 mx-auto mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-sm font-medium text-red-600 mb-2">{mapError}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setMapError(null);
                              setMapLoading(true);
                              mapInitializedRef.current = false;
                              // Force re-initialization
                              if (mapContainerRef.current) {
                                const checkAndInit = () => {
                                  if (mapContainerRef.current) {
                                    window.location.reload();
                                  }
                                };
                                setTimeout(checkAndInit, 100);
                              }
                            }}
                            className="text-xs text-accent-red hover:text-accent-red/80 underline"
                          >
                            Retry
                          </button>
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
                  #listing-location-map {
                    position: relative !important;
                    z-index: 0 !important;
                  }
                  #listing-location-map .leaflet-container {
                    height: 100% !important;
                    width: 100% !important;
                    z-index: 0 !important;
                    position: relative !important;
                  }
                  #listing-location-map .leaflet-tile-container img {
                    max-width: none !important;
                  }
                  #listing-location-map .leaflet-pane {
                    z-index: 400 !important;
                  }
                  #listing-location-map .leaflet-tile-pane {
                    z-index: 200 !important;
                  }
                  #listing-location-map .leaflet-overlay-pane {
                    z-index: 400 !important;
                  }
                  #listing-location-map .leaflet-shadow-pane {
                    z-index: 500 !important;
                  }
                  #listing-location-map .leaflet-marker-pane {
                    z-index: 600 !important;
                  }
                  #listing-location-map .leaflet-tooltip-pane {
                    z-index: 650 !important;
                  }
                  #listing-location-map .leaflet-popup-pane {
                    z-index: 700 !important;
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-accent-red hover:bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WEBP (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, image: null }));
                        setImagePreview(null);
                        const fileInput = document.getElementById('image');
                        if (fileInput) fileInput.value = '';
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
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
                )}

                {errors.image && (
                  <p className="text-xs text-red-600">{errors.image}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
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
                {isSubmitting ? 'Creating...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

