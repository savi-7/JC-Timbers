import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import StarRating from './StarRating';
import { useNotification } from './NotificationProvider';

export default function ReviewModal({ product, onClose, onSuccess }) {
  const { showSuccess, showError } = useNotification();
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  useEffect(() => {
    checkIfCanReview();
  }, [product._id]);

  const checkIfCanReview = async () => {
    try {
      setCheckingEligibility(true);
      const response = await api.get('/reviews/can-review', {
        params: { productId: product._id }
      });
      
      setCanReview(response.data.canReview);
      
      if (!response.data.canReview && response.data.review) {
        setExistingReview(response.data.review);
        setRating(response.data.review.rating);
        setReviewTitle(response.data.review.reviewTitle || '');
        setReviewerName(response.data.review.reviewerName || '');
        setReviewText(response.data.review.reviewText || '');
      }
    } catch (error) {
      console.error('Check review eligibility error:', error);
      showError('Failed to check review eligibility');
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      showError('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, {
          data: reader.result,
          contentType: file.type,
          filename: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      showError('Please select a rating');
      return;
    }
    
    if (!reviewTitle || reviewTitle.trim().length < 3) {
      showError('Review title must be at least 3 characters');
      return;
    }
    
    if (!reviewerName || reviewerName.trim().length < 2) {
      showError('Please enter your name (at least 2 characters)');
      return;
    }

    try {
      setLoading(true);
      
      await api.post('/reviews', {
        productId: product._id,
        rating,
        reviewTitle: reviewTitle.trim(),
        reviewerName: reviewerName.trim(),
        reviewText: reviewText.trim(),
        images
      });

      showSuccess('Review submitted successfully! It will appear after admin approval.');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Submit review error:', error);
      showError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
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

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (checkingEligibility) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking review eligibility...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <h2 className="text-xl font-heading text-dark-brown">
            {existingReview ? 'Your Review' : 'Write a Review'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Product Info */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
            <img
              src={getProductImage()}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-dark-brown">{product.name}</h3>
              <p className="text-sm text-gray-600 mt-1">₹{product.price?.toLocaleString()}</p>
            </div>
          </div>

          {/* Existing Review Display */}
          {existingReview ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  You have already reviewed this product
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <StarRating rating={existingReview.rating} readonly size="lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
                <div className="bg-gray-50 rounded-lg p-3 text-gray-700 font-medium">
                  {existingReview.reviewTitle || 'No title'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <div className="bg-gray-50 rounded-lg p-3 text-gray-700">
                  {existingReview.reviewerName || 'Anonymous'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                  {existingReview.reviewText || <em className="text-gray-500">No review text provided</em>}
                </div>
              </div>

              {existingReview.images && existingReview.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Images</label>
                  <div className="flex gap-2 flex-wrap">
                    {existingReview.images.map((img, index) => (
                      <img
                        key={index}
                        src={img.data}
                        alt={`Review ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(existingReview.status)}`}>
                  {existingReview.status}
                </span>
                {existingReview.status === 'Pending' && (
                  <p className="text-sm text-gray-600 mt-2">Your review is pending admin approval.</p>
                )}
              </div>

              {existingReview.adminResponse && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">Admin Response</p>
                  <p className="text-sm text-blue-800">{existingReview.adminResponse}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onClose();
                    // Navigate to My Reviews page
                    window.location.href = '/my-reviews';
                  }}
                  className="flex-1 px-4 py-2 bg-dark-brown text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Edit Review
                </button>
              </div>
            </div>
          ) : (
            /* New Review Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <StarRating rating={rating} setRating={setRating} size="xl" />
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                  placeholder="e.g., Great quality timber!"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{reviewTitle.length}/100 characters</p>
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                  placeholder="Share your experience with this product..."
                />
                <p className="text-xs text-gray-500 mt-1">{reviewText.length}/1000 characters</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Photos (Optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.data}
                        alt={`Upload ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-dark-brown transition-colors">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleImageUpload}
                        className="hidden"
                        multiple
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500">Max 5 images, 5MB each (PNG/JPG only)</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-dark-brown text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={loading || rating === 0}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

