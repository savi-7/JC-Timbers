import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { StarRatingDisplay } from './StarRating';
import StarRating from './StarRating';

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/product/${productId}`, {
        params: { page, limit: 10 }
      });
      setReviews(response.data.reviews);
      setStats(response.data.stats);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingPercentage = (rating) => {
    if (!stats || stats.total === 0) return 0;
    return ((stats.distribution[rating] / stats.total) * 100).toFixed(0);
  };

  if (loading && page === 1) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-brown mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-gray-200 pt-12">
      <h3 className="text-2xl font-heading text-dark-brown mb-6">Customer Reviews</h3>

      {stats && stats.total > 0 ? (
        <>
          {/* Rating Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Overall Rating */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <span className="text-5xl font-bold text-dark-brown">{stats.average}</span>
                  <div>
                    <StarRating rating={Math.round(parseFloat(stats.average))} readonly size="md" />
                    <p className="text-sm text-gray-600 mt-1">{stats.total} {stats.total === 1 ? 'review' : 'reviews'}</p>
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-8">{rating} ⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getRatingPercentage(rating)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {getRatingPercentage(rating)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-6">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-semibold text-gray-600">
                      {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>

                  <div className="flex-1">
                    {/* User Info & Rating */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-dark-brown">{review.reviewerName || 'Anonymous'}</p>
                        <StarRating rating={review.rating} readonly size="sm" />
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Review Title */}
                    {review.reviewTitle && (
                      <h4 className="text-base font-semibold text-dark-brown mb-2">{review.reviewTitle}</h4>
                    )}

                    {/* Review Text */}
                    {review.reviewText && (
                      <p className="text-gray-700 mb-3">{review.reviewText}</p>
                    )}

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.images.map((img, index) => (
                          <img
                            key={index}
                            src={img.data}
                            alt={`Review ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(img.data, '_blank')}
                          />
                        ))}
                      </div>
                    )}

                    {/* Admin Response */}
                    {review.adminResponse && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-3">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Response from JC Timbers</p>
                        <p className="text-sm text-blue-800">{review.adminResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <h4 className="text-lg font-medium text-gray-700 mb-2">No Reviews Yet</h4>
          <p className="text-gray-500">Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
}

