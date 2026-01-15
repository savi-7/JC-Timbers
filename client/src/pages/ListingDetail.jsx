import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';

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
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadListing();
    checkIfSaved();
  }, [id, isAuthenticated]);

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
        alert('Listing not found');
        navigate('/marketplace');
        return;
      }

      setListing(foundListing);
    } catch (error) {
      console.error('Error loading listing:', error);
      alert('Failed to load listing');
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
        alert('Removed from saved items');
      } else {
        savedItems.push(id);
        localStorage.setItem(`saved_items_${user.email}`, JSON.stringify(savedItems));
        setIsSaved(true);
        alert('Saved to your items');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
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
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link');
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

                <div className="grid grid-cols-3 gap-3">
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
                  <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
                        getBoundingBox(listing.location)
                      )}&layer=mapnik&marker=1&q=${encodeURIComponent(listing.location)}`}
                      title="Location Map"
                      className="w-full h-full"
                    />
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                      <a
                        href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(listing.location)}`}
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
            </div>
          </div>
        </section>

        {/* Message Modal */}
        {showMessageModal && (
          <MessageModal
            listing={listing}
            onClose={() => setShowMessageModal(false)}
            currentUser={user}
          />
        )}

        {/* Report Modal */}
        {showReportModal && (
          <ReportModal
            listing={listing}
            onClose={() => setShowReportModal(false)}
            currentUser={user}
          />
        )}
      </main>
    </div>
  );
}

// Helper function to get bounding box for OpenStreetMap (simplified)
// In production, use a geocoding service like Nominatim to get coordinates
function getBoundingBox(location) {
  // Default bounding box (can be improved with geocoding)
  // Format: min_lon,min_lat,max_lon,max_lat
  // This is a placeholder - ideally you'd geocode the location string
  return '-180,-90,180,90';
}

// Message Modal Component
function MessageModal({ listing, onClose, currentUser }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) {
      alert('Please enter a message');
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
      const storageKey = `marketplace_inbox_${listing.userId}`;
      const existingMessages = JSON.parse(
        localStorage.getItem(storageKey) || '[]'
      );
      existingMessages.push(newMessage);
      localStorage.setItem(storageKey, JSON.stringify(existingMessages));

      alert('Message sent! The seller will see it in their inbox.');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
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
function ReportModal({ listing, onClose, currentUser }) {
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
      alert('Please select a reason');
      return;
    }

    // TODO: Connect to backend report API
    console.log('Report submitted:', {
      listingId: listing.id,
      reportedBy: currentUser?.email,
      reason: reason,
      details: details,
    });

    alert('Thank you for your report. We will review it shortly.');
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

