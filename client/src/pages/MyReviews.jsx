import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StarRating from '../components/StarRating';
import { useNotification } from '../components/NotificationProvider';

export default function MyReviews() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, reviewTitle: '', reviewerName: '', reviewText: '' });

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews/my-reviews');
      setReviews(response.data);
    } catch (error) {
      showError('Failed to load reviews');
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review._id);
    setEditForm({
      rating: review.rating,
      reviewTitle: review.reviewTitle || '',
      reviewerName: review.reviewerName || '',
      reviewText: review.reviewText || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditForm({ rating: 5, reviewTitle: '', reviewerName: '', reviewText: '' });
  };

  const handleSaveEdit = async (reviewId) => {
    try {
      await api.put(`/reviews/${reviewId}`, editForm);
      showSuccess('Review updated successfully! It will be reviewed by admin.');
      setEditingReview(null);
      fetchMyReviews();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);
      showSuccess('Review deleted successfully');
      fetchMyReviews();
    } catch (error) {
      showError('Failed to delete review');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getProductImage = (product) => {
    if (product?.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage.data) {
        if (firstImage.data.startsWith('data:')) {
          return firstImage.data;
        }
        return `data:${firstImage.contentType};base64,${firstImage.data}`;
      }
      if (firstImage.filename) {
        return `/uploads/${firstImage.filename}`;
      }
    }
    return 'https://via.placeholder.com/100x100/f3f4f6/9ca3af?text=No+Image';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-cream py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading text-dark-brown mb-2">My Reviews</h1>
            <p className="text-gray-600">Manage your product reviews</p>
          </div>
          <button
            onClick={() => navigate('/order-history')}
            className="px-4 py-2 bg-accent-red text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Order History
          </button>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h3 className="text-xl font-heading text-gray-700 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 mb-4">You haven't written any reviews yet</p>
            <button
              onClick={() => navigate('/order-history')}
              className="px-6 py-2 bg-dark-brown text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              View Orders
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  {/* Product Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={getProductImage(review.product)}
                      alt={review.product?.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-heading text-dark-brown mb-1">
                        {review.product?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusBadge(review.status)}`}>
                        {review.status}
                      </span>
                    </div>
                  </div>

                  {/* Review Content */}
                  {editingReview === review._id ? (
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <StarRating
                          rating={editForm.rating}
                          setRating={(rating) => setEditForm({ ...editForm, rating })}
                          size="lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
                        <input
                          type="text"
                          value={editForm.reviewTitle}
                          onChange={(e) => setEditForm({ ...editForm, reviewTitle: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                          placeholder="e.g., Great product!"
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                        <input
                          type="text"
                          value={editForm.reviewerName}
                          onChange={(e) => setEditForm({ ...editForm, reviewerName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                          placeholder="Enter your name"
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                        <textarea
                          value={editForm.reviewText}
                          onChange={(e) => setEditForm({ ...editForm, reviewText: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                          placeholder="Share your experience with this product..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(review._id)}
                          className="px-4 py-2 bg-dark-brown text-white rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t pt-4">
                      <div className="mb-3">
                        <StarRating rating={review.rating} readonly size="md" />
                      </div>
                      {review.reviewTitle && (
                        <h4 className="text-lg font-semibold text-dark-brown mb-2">{review.reviewTitle}</h4>
                      )}
                      {review.reviewerName && (
                        <p className="text-sm text-gray-600 mb-3">By: {review.reviewerName}</p>
                      )}
                      {review.reviewText && (
                        <p className="text-gray-700 mb-4">{review.reviewText}</p>
                      )}
                      
                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-4">
                          {review.images.map((img, index) => (
                            <img
                              key={index}
                              src={img.data}
                              alt={`Review ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}

                      {/* Admin Response */}
                      {review.adminResponse && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                          <p className="text-sm font-medium text-blue-900 mb-1">Admin Response</p>
                          <p className="text-sm text-blue-800">{review.adminResponse}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEdit(review)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Edit Review
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

