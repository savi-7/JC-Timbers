import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationProvider';

export default function SellerProfileModal({
  seller,
  sellerEmail,
  onClose,
  currentUser,
  isAuthenticated,
  showSuccess,
  showError,
  isFollowing,
  onFollowChange,
}) {
  const navigate = useNavigate();
  const { showInfo } = useNotification();
  const [sellerListings, setSellerListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'available', 'sold'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'alphabetical'
  const [rating, setRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    loadSellerListings();
    calculateRating();
  }, [sellerEmail]);

  useEffect(() => {
    filterAndSortListings();
  }, [sellerListings, searchQuery, stockFilter, sortBy]);

  const loadSellerListings = () => {
    try {
      const listingsKey = `marketplace_listings_${sellerEmail}`;
      const listings = JSON.parse(localStorage.getItem(listingsKey) || '[]');
      setSellerListings(listings);
    } catch (error) {
      console.error('Error loading seller listings:', error);
      setSellerListings([]);
    }
  };

  const calculateRating = () => {
    try {
      // Get ratings from messages/reviews (simplified - in production, use a dedicated ratings system)
      const inboxKey = `marketplace_inbox_${sellerEmail}`;
      const messages = JSON.parse(localStorage.getItem(inboxKey) || '[]');
      
      // For now, use a placeholder rating calculation
      // In production, implement a proper rating system
      const ratings = messages.filter(m => m.rating).map(m => m.rating);
      if (ratings.length > 0) {
        const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        setRating(avgRating);
        setRatingCount(ratings.length);
      } else {
        setRating(0);
        setRatingCount(0);
      }
    } catch (error) {
      console.error('Error calculating rating:', error);
    }
  };

  const filterAndSortListings = () => {
    let filtered = [...sellerListings];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title?.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query) ||
          listing.category?.toLowerCase().includes(query)
      );
    }

    // Filter by stock status
    if (stockFilter === 'available') {
      filtered = filtered.filter((listing) => listing.status === 'active' || !listing.status);
    } else if (stockFilter === 'sold') {
      filtered = filtered.filter((listing) => listing.status === 'sold');
    }

    // Sort listings
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    setFilteredListings(filtered);
  };

  const handleFollow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const following = JSON.parse(
        localStorage.getItem(`marketplace_following_${currentUser?.email}`) || '[]'
      );

      if (isFollowing) {
        const updated = following.filter((email) => email !== sellerEmail);
        localStorage.setItem(`marketplace_following_${currentUser?.email}`, JSON.stringify(updated));
        onFollowChange(false);
        showSuccess('Unfollowed seller');
      } else {
        if (!following.includes(sellerEmail)) {
          following.push(sellerEmail);
        }
        localStorage.setItem(`marketplace_following_${currentUser?.email}`, JSON.stringify(following));
        onFollowChange(true);
        showSuccess('Following seller');
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      showError('Failed to update follow status');
    }
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // TODO: Implement report seller functionality
    showInfo('Report functionality coming soon');
  };

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col relative z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-heading text-2xl text-dark-brown">Seller Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Seller Info Section */}
          <div className="mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-dark-brown to-accent-red flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0">
                {seller?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-2xl text-dark-brown mb-2">{seller?.name || 'Seller'}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Your marketplace privacy settings control what people, including marketplace users, can see on your profile. Go to Settings
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleFollow}
                    className={`px-4 py-2 rounded-lg border font-paragraph text-sm transition-colors flex items-center gap-2 ${
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
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={handleReport}
                    className="px-4 py-2 rounded-lg border border-red-300 text-red-700 font-paragraph text-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Report
                  </button>
                </div>
              </div>
            </div>

            {/* Seller Ratings */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-heading text-lg text-dark-brown mb-3">Seller ratings</h4>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {ratingCount > 0 ? (
                <p className="text-sm text-gray-600">
                  {rating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  No ratings
                  <span className="text-xs text-gray-400 ml-2">
                    (Visible to the public after 5 ratings. Learn more)
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Seller's Listings Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading text-lg text-dark-brown">
                {seller?.name || 'Seller'}'s listings
              </h4>
              {sellerListings.length > 0 && (
                <span className="text-sm text-accent-red hover:underline font-medium cursor-pointer">
                  See more insights
                </span>
              )}
            </div>

            {sellerListings.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  You can manage listings from Your listings page. Your listings in private groups may not be visible to buyers.
                </p>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search listings"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/70 focus:border-accent-red"
                    />
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/70 focus:border-accent-red"
                  >
                    <option value="all">All stock</option>
                    <option value="available">Available and in stock</option>
                    <option value="sold">Sold out</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/70 focus:border-accent-red"
                  >
                    <option value="newest">Newest by date</option>
                    <option value="oldest">Oldest by date</option>
                    <option value="alphabetical">Alphabetic (A-Z)</option>
                  </select>
                </div>

                {/* Listings Grid */}
                {filteredListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredListings.map((listing) => (
                      <div
                        key={listing.id}
                        onClick={() => {
                          onClose();
                          navigate(`/marketplace/listing/${listing.id}`);
                        }}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-48 bg-gray-100">
                          {listing.imagePreview || listing.image ? (
                            <img
                              src={listing.imagePreview || listing.image}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              Sold
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h5 className="font-medium text-dark-brown mb-1 line-clamp-2">
                            {listing.title}
                          </h5>
                          <p className="text-lg font-semibold text-dark-brown mb-2">
                            ₹{parseFloat(listing.price || 0).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500">
                            Listed {formatDate(listing.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p className="text-gray-500">No listings found</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-24 h-24 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-gray-500 mb-2">No listings found</p>
                <p className="text-sm text-gray-400">
                  This seller hasn't listed any products yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
