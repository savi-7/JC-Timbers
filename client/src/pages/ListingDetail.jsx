import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import SellerProfileModal from '../components/SellerProfileModal';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';

const CONDITION_LABELS = {
  'new': 'New',
  'used-like-new': 'Used - Like New',
  'used-good': 'Used - Good',
  'fair': 'Fair',
};

export default function ListingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSellerProfileModal, setShowSellerProfileModal] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: 20.5937, lon: 78.9629 });
  const [mapLoading, setMapLoading] = useState(true);
  const [sellerData, setSellerData] = useState(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInitializedRef = useRef(false);

  useEffect(() => {
    loadListing();
    checkIfSaved();
    trackRecentlyViewed();
  }, [id, isAuthenticated, user]);

  // Update map coordinates when listing is loaded
  useEffect(() => {
    if (listing) {
      if (listing.locationCoords && listing.locationCoords.lat && listing.locationCoords.lon) {
        // Use saved coordinates from listing
        setMapCoords({
          lat: listing.locationCoords.lat,
          lon: listing.locationCoords.lon,
        });
      } else if (listing.location) {
        // Geocode location string if coordinates not available
        geocodeLocation(listing.location);
      }
      
      // Load seller data
      loadSellerData(listing.userId);
    }
  }, [listing]);

  const loadSellerData = (sellerEmail) => {
    try {
      const sellerDashboard = localStorage.getItem(`seller_dashboard_${sellerEmail}`);
      if (sellerDashboard) {
        const seller = JSON.parse(sellerDashboard);
        setSellerData({
          name: seller.name || sellerEmail.split('@')[0],
          email: seller.email || sellerEmail,
          phone: seller.phone || '',
          location: seller.location || '',
          ...seller,
        });
      } else {
        // Fallback if seller dashboard doesn't exist
        setSellerData({
          name: sellerEmail.split('@')[0],
          email: sellerEmail,
          phone: '',
          location: '',
        });
      }
    } catch (error) {
      console.error('Error loading seller data:', error);
      setSellerData({
        name: sellerEmail.split('@')[0],
        email: sellerEmail,
        phone: '',
        location: '',
      });
    }
  };

  useEffect(() => {
    if (listing && isAuthenticated && user) {
      checkIfFollowing();
    }
  }, [listing, isAuthenticated, user]);

  const loadListing = () => {
    try {
      // Get listing from all users' localStorage
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

      const foundListing = allListings.find((l) => l.id === id);
      
      if (!foundListing) {
        showError('Listing not found');
        navigate('/marketplace');
        return;
      }

      setListing(foundListing);
    } catch (error) {
      console.error('Error loading listing:', error);
      showError('Failed to load listing');
      navigate('/marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfSaved = () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const savedItems = JSON.parse(
        localStorage.getItem(`saved_items_${user.email}`) || '[]'
      );
      setIsSaved(savedItems.includes(id));
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const checkIfFollowing = () => {
    if (!isAuthenticated || !user || !listing) return;
    
    try {
      const following = JSON.parse(
        localStorage.getItem(`marketplace_following_${user.email}`) || '[]'
      );
      setIsFollowing(following.includes(listing.userId));
    } catch (error) {
      console.error('Error checking following status:', error);
    }
  };

  const handleFollow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!listing) return;

    try {
      const following = JSON.parse(
        localStorage.getItem(`marketplace_following_${user.email}`) || '[]'
      );
      
      if (isFollowing) {
        const updated = following.filter((email) => email !== listing.userId);
        localStorage.setItem(`marketplace_following_${user.email}`, JSON.stringify(updated));
        setIsFollowing(false);
        showSuccess('Unfollowed seller');
      } else {
        if (!following.includes(listing.userId)) {
          following.push(listing.userId);
        }
        localStorage.setItem(`marketplace_following_${user.email}`, JSON.stringify(following));
        setIsFollowing(true);
        showSuccess('Following seller');
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      showError('Failed to update follow status');
    }
  };

  const trackRecentlyViewed = () => {
    if (!isAuthenticated || !user || !id) return;

    try {
      const recentData = JSON.parse(
        localStorage.getItem(`recently_viewed_${user.email}`) || '[]'
      );

      // Remove if already exists
      const filtered = recentData.filter((item) => item.listingId !== id);

      // Add to beginning
      filtered.unshift({
        listingId: id,
        viewedAt: new Date().toISOString(),
      });

      // Keep only last 50 items
      const limited = filtered.slice(0, 50);

      localStorage.setItem(
        `recently_viewed_${user.email}`,
        JSON.stringify(limited)
      );
    } catch (error) {
      console.error('Error tracking recently viewed:', error);
    }
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const savedItems = JSON.parse(
        localStorage.getItem(`saved_items_${user.email}`) || '[]'
      );
      
      if (isSaved) {
        const updated = savedItems.filter((itemId) => itemId !== id);
        localStorage.setItem(`saved_items_${user.email}`, JSON.stringify(updated));
        setIsSaved(false);
        showSuccess('Removed from saved items');
      } else {
        savedItems.push(id);
        localStorage.setItem(`saved_items_${user.email}`, JSON.stringify(savedItems));
        setIsSaved(true);
        showSuccess('Saved to your items');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      showError('Failed to save item');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: listing?.description,
        url: url,
      }).catch((error) => {
        console.error('Error sharing:', error);
        copyToClipboard(url);
      });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess('Link copied to clipboard!');
    }).catch(() => {
      showError('Failed to copy link');
    });
  };

  const handleSendMessage = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowMessageModal(true);
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowReportModal(true);
  };

  const geocodeLocation = async (locationString) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}&limit=1&countrycodes=in`,
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
      if (data.length > 0) {
        setMapCoords({
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        });
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      // Keep default coordinates if geocoding fails
    }
  };

  // Initialize interactive map
  useEffect(() => {
    if (!mapContainerRef.current || mapInitializedRef.current || !listing) return;

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

    const tryInitializeMap = () => {
      const checkAndInit = (attempts = 0) => {
        if (!mapContainerRef.current) {
          if (attempts < 20) {
            setTimeout(() => checkAndInit(attempts + 1), 200);
          }
          return;
        }

        const hasDimensions =
          mapContainerRef.current.offsetHeight > 0 ||
          mapContainerRef.current.offsetWidth > 0 ||
          mapContainerRef.current.clientHeight > 0;

        if (!hasDimensions && attempts < 20) {
          setTimeout(() => checkAndInit(attempts + 1), 200);
          return;
        }

        if (!window.L || !mapContainerRef.current || mapInitializedRef.current) return;

        try {
          const map = window.L.map(mapContainerRef.current, {
            center: [mapCoords.lat, mapCoords.lon],
            zoom: 13,
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
            draggable: false,
          }).addTo(map);

          // Add popup with location info
          marker.bindPopup(`<strong>${listing.location || 'Product Location'}</strong>`).openPopup();

          markerRef.current = marker;
          mapRef.current = map;
          mapInitializedRef.current = true;
          setMapLoading(false);

          setTimeout(() => {
            if (map) {
              map.invalidateSize();
              map.setView([mapCoords.lat, mapCoords.lon], 13);
            }
          }, 300);
        } catch (error) {
          console.error('Error initializing map:', error);
          setMapLoading(false);
        }
      };

      checkAndInit();
    };

    loadLeaflet()
      .then(() => {
        tryInitializeMap();
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
  }, [listing, mapCoords.lat, mapCoords.lon]);

  // Update map when coordinates change
  useEffect(() => {
    if (markerRef.current && mapRef.current && mapInitializedRef.current) {
      markerRef.current.setLatLng([mapCoords.lat, mapCoords.lon]);
      mapRef.current.setView([mapCoords.lat, mapCoords.lon], 13);
      if (listing?.location) {
        markerRef.current.setPopupContent(`<strong>${listing.location}</strong>`).openPopup();
      }
      // Force invalidate size after view change
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);
    }
  }, [mapCoords.lat, mapCoords.lon, listing?.location]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
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
            if (isAuthenticated) {
              navigate('/marketplace/create-listing');
            } else {
              navigate('/login');
            }
          }}
        />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image */}
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {listing.imagePreview || listing.image ? (
                  <img
                    src={listing.imagePreview || listing.image}
                    alt={listing.title}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                    <svg
                      className="w-24 h-24 text-gray-400"
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
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Title and Listed Date */}
              <div>
                <h1 className="font-heading text-3xl text-dark-brown mb-2">
                  {listing.title}
                </h1>
                <p className="text-sm text-gray-500">
                  Listed on {formatDate(listing.createdAt)}
                </p>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Price</p>
                <p className="font-heading text-3xl text-dark-brown">
                  ₹{parseFloat(listing.price).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSendMessage}
                  className="w-full py-3 px-4 rounded-xl bg-accent-red text-white font-paragraph hover:bg-accent-red/90 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span>Send Message to Seller</span>
                </button>

                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={handleSave}
                    className={`py-2.5 px-4 rounded-xl border font-paragraph text-sm transition-colors flex items-center justify-center gap-2 ${
                      isSaved
                        ? 'bg-accent-red/10 border-accent-red text-accent-red'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`}
                      fill={isSaved ? 'currentColor' : 'none'}
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
                    <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    onClick={handleFollow}
                    className={`py-2.5 px-4 rounded-xl border font-paragraph text-sm transition-colors flex items-center justify-center gap-2 ${
                      isFollowing
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${isFollowing ? 'fill-current' : ''}`}
                      fill={isFollowing ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    <span className="hidden sm:inline">{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-paragraph text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  <button
                    onClick={handleReport}
                    className="py-2.5 px-4 rounded-xl border border-red-300 text-red-700 font-paragraph text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Report</span>
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-heading text-xl text-dark-brown mb-4">Product Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Category</p>
                    <p className="text-dark-brown">{listing.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Condition</p>
                    <p className="text-dark-brown">
                      {CONDITION_LABELS[listing.condition] || listing.condition}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                    <p className="text-dark-brown whitespace-pre-wrap">{listing.description}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              {listing.location && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="font-heading text-xl text-dark-brown mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-accent-red"
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
                    Location
                  </h2>
                  <p className="text-dark-brown mb-4">{listing.location}</p>
                  
                  {/* Interactive Map */}
                  <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                    <div
                      ref={mapContainerRef}
                      id="listing-detail-map"
                      className="w-full h-full"
                      style={{
                        height: '100%',
                        width: '100%',
                        zIndex: showSellerProfileModal ? 1 : 'auto',
                        position: 'relative',
                      }}
                    >
                      {/* Loading indicator */}
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
                    
                    {/* OpenStreetMap Link */}
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${mapCoords.lat}&mlon=${mapCoords.lon}&zoom=13`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent-red hover:underline font-medium"
                      >
                        View on OpenStreetMap →
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Seller Details */}
              {listing && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="font-heading text-xl text-dark-brown mb-4">Seller Details</h2>
                  <button
                    onClick={() => setShowSellerProfileModal(true)}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dark-brown to-accent-red flex items-center justify-center text-white text-lg font-semibold">
                        {(sellerData?.name || listing.userId?.split('@')[0])?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-dark-brown text-lg">
                          {sellerData?.name || listing.userId?.split('@')[0] || 'Seller'}
                        </p>
                        <p className="text-sm text-gray-500">Click to view seller profile</p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Message Modal */}
        {showMessageModal && (
          <MessageModal
            listing={listing}
            onClose={() => setShowMessageModal(false)}
            currentUser={user}
            showSuccess={showSuccess}
            showError={showError}
          />
        )}

        {/* Report Modal */}
        {showReportModal && (
          <ReportModal
            listing={listing}
            onClose={() => setShowReportModal(false)}
            currentUser={user}
            showSuccess={showSuccess}
            showError={showError}
          />
        )}

        {/* Seller Profile Modal */}
        {showSellerProfileModal && listing && sellerData && (
          <>
            {/* Add style to limit Leaflet z-index when modal is open */}
            <style>{`
              #listing-detail-map .leaflet-container,
              #listing-detail-map .leaflet-pane,
              #listing-detail-map .leaflet-map-pane,
              #listing-detail-map .leaflet-tile-pane,
              #listing-detail-map .leaflet-overlay-pane,
              #listing-detail-map .leaflet-shadow-pane,
              #listing-detail-map .leaflet-marker-pane,
              #listing-detail-map .leaflet-tooltip-pane,
              #listing-detail-map .leaflet-popup-pane,
              #listing-detail-map .leaflet-control {
                z-index: 1 !important;
              }
            `}</style>
            <SellerProfileModal
              seller={sellerData}
              sellerEmail={listing.userId}
              onClose={() => setShowSellerProfileModal(false)}
              currentUser={user}
              isAuthenticated={isAuthenticated}
              showSuccess={showSuccess}
              showError={showError}
              isFollowing={isFollowing}
              onFollowChange={(following) => setIsFollowing(following)}
            />
          </>
        )}
      </main>
    </div>
  );
}

// Message Modal Component
function MessageModal({ listing, onClose, currentUser, showSuccess, showError }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) {
      showError('Please enter a message');
      return;
    }

    try {
      // Save message to seller's inbox
      const newMessage = {
        id: Date.now().toString(),
        fromEmail: currentUser?.email,
        fromName: currentUser?.name,
        toEmail: listing.userId,
        listingId: listing.id,
        listingTitle: listing.title,
        listingPrice: listing.price,
        listingCategory: listing.category,
        listingImage: listing.imagePreview || listing.image,
        message: message,
        timestamp: new Date().toISOString(),
        read: false,
      };

      // Save to seller's inbox
      const sellerInboxKey = `marketplace_inbox_${listing.userId}`;
      const sellerMessages = JSON.parse(
        localStorage.getItem(sellerInboxKey) || '[]'
      );
      sellerMessages.push(newMessage);
      localStorage.setItem(sellerInboxKey, JSON.stringify(sellerMessages));

      // Also save to buyer's sent messages
      const buyerSentKey = `marketplace_sent_messages_${currentUser?.email}`;
      const sentMessages = JSON.parse(
        localStorage.getItem(buyerSentKey) || '[]'
      );
      sentMessages.push({
        ...newMessage,
        toName: listing.userName || listing.userId.split('@')[0],
        toEmail: listing.userId,
      });
      localStorage.setItem(buyerSentKey, JSON.stringify(sentMessages));

      showSuccess('Message sent! The seller will see it in their inbox.');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="font-heading text-2xl text-dark-brown mb-4">Send Message to Seller</h2>

        {/* Product Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-500 mb-2">About this item:</p>
          <div className="flex gap-4">
            {listing.imagePreview && (
              <img
                src={listing.imagePreview}
                alt={listing.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-dark-brown mb-1">{listing.title}</p>
              <p className="text-sm text-gray-500">₹{parseFloat(listing.price).toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400 mt-1">{listing.category}</p>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="6"
            placeholder="Hi, I'm interested in this item. Could you tell me more about it?"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/70 focus:border-accent-red resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-paragraph rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-6 py-2.5 text-sm font-paragraph rounded-lg bg-accent-red text-white hover:bg-accent-red/90 transition-colors"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

// Report Modal Component
function ReportModal({ listing, onClose, currentUser, showSuccess, showError }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const reportReasons = [
    'Spam or Scam',
    'Inappropriate Content',
    'Wrong Category',
    'Duplicate Listing',
    'Other',
  ];

  const handleSubmit = () => {
    if (!reason) {
      showError('Please select a reason');
      return;
    }

    // TODO: Connect to backend report API
    console.log('Report submitted:', {
      listingId: listing.id,
      reportedBy: currentUser?.email,
      reason: reason,
      details: details,
    });

    showSuccess('Thank you for your report. We will review it shortly.');
    setReason('');
    setDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="font-heading text-2xl text-dark-brown mb-4">Report Listing</h2>
        <p className="text-sm text-gray-500 mb-6">
          Help us keep the marketplace safe by reporting any issues with this listing.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Reporting
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/70 focus:border-accent-red"
            >
              <option value="">Select a reason</option>
              {reportReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows="4"
              placeholder="Please provide any additional information..."
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/70 focus:border-accent-red resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-paragraph rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-paragraph rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

