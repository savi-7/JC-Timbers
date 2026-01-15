import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';

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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

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
    }

    // Price validation
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Please enter a valid price greater than 0';
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
        const { image, ...listingData } = formData;
        const newListing = {
          id: Date.now().toString(),
          ...listingData,
          imagePreview: imagePreviewData || null,
          status: 'active',
          createdAt: new Date().toISOString(),
          userId: user?.email,
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
        alert('Listing created successfully!');
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
      alert('Failed to create listing. Please try again.');
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
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="E.g. Mumbai, Maharashtra"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.location
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:ring-accent-red/70 focus:border-accent-red'
                }`}
              />
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

