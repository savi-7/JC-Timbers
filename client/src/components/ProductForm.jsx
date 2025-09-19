import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNotification } from './NotificationProvider';

export default function ProductForm({ product, onClose, onSuccess }) {
  const isEdit = !!product;
  const { showSuccess, showError } = useNotification();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'timber',
    quantity: '',
    unit: 'pieces',
    price: '',
    size: '',
    description: '',
    attributes: {},
    featuredType: 'none'
  });

  // Image state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Category-specific attribute configurations
  const categoryAttributes = {
    timber: {
      woodType: '',
      dimension: '',
      grade: ''
    },
    furniture: {
      furnitureType: '',
      material: '',
      polish: '',
      style: ''
    },
    construction: {
      productType: '',
      size: '',
      finish: '',
      usage: ''
    }
  };

  // Initialize form data
  useEffect(() => {
    console.log('Initializing form data, isEdit:', isEdit, 'product:', product);
    
    if (isEdit && product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'timber',
        quantity: product.quantity || '',
        unit: product.unit || 'pieces',
        price: product.price || '',
        size: product.size || '',
        description: product.description || '',
        attributes: product.attributes || {},
        featuredType: product.featuredType || 'none'
      });
      setExistingImages(product.images || []);
    } else {
      setFormData({
        name: '',
        category: 'timber',
        quantity: '',
        unit: 'pieces',
        price: '',
        size: '',
        description: '',
        attributes: categoryAttributes.timber,
        featuredType: 'none'
      });
    }
  }, [product, isEdit]);

  // Update attributes when category changes
  useEffect(() => {
    if (!isEdit || !product) {
      setFormData(prev => ({
        ...prev,
        attributes: categoryAttributes[formData.category] || {}
      }));
    }
  }, [formData.category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name}:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttributeChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value
      }
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5 - existingImages.length + imagesToRemove.length;
    
    if (files.length > maxFiles) {
      showError(`You can only select up to ${maxFiles} more images`);
      return;
    }

    setSelectedFiles(files);
  };

  const removeExistingImage = (publicId) => {
    setImagesToRemove(prev => [...prev, publicId]);
    setExistingImages(prev => prev.filter(img => img.public_id !== publicId));
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission - Current form data:', formData);
    
    // Validate required fields with more detailed checks
    const errors = [];
    
    if (!formData.name || formData.name.trim() === '') {
      errors.push('Product name is required');
    }
    
    if (!formData.category || formData.category.trim() === '') {
      errors.push('Category is required');
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.push('Price must be greater than 0');
    }
    
    console.log('Validation errors:', errors);
    
    if (errors.length > 0) {
      showError('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    setUploading(true);

    try {
      const submitData = new FormData();
      
      // Add form fields
      submitData.append('name', formData.name.trim());
      submitData.append('category', formData.category);
      submitData.append('quantity', formData.quantity || 0);
      submitData.append('unit', formData.unit);
      submitData.append('price', formData.price);
      submitData.append('size', formData.size || '');
      submitData.append('description', formData.description || '');
      submitData.append('attributes', JSON.stringify(formData.attributes || {}));
      submitData.append('featuredType', formData.featuredType);

      // Add new images
      selectedFiles.forEach(file => {
        submitData.append('images', file);
      });

      console.log('Submitting product with data:', {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        imagesCount: selectedFiles.length
      });

      if (isEdit) {
        // Update existing product
        await api.put(`/products/${product._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new product
        await api.post('/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      showSuccess(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
      onSuccess();
    } catch (error) {
      console.error('Error submitting product:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} product`;
      showError(`Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const renderCategoryFields = () => {
    const fields = categoryAttributes[formData.category] || {};
    
    return Object.keys(fields).map(key => (
      <div key={key}>
        <label className="block text-sm font-medium text-gray-700 capitalize">
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </label>
        <input
          type="text"
          value={formData.attributes[key] || ''}
          onChange={(e) => handleAttributeChange(key, e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
        />
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h3>
          
          {/* Debug info - remove this in production */}
          <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
            <strong>Debug Info:</strong><br/>
            Name: "{formData.name}" | Category: "{formData.category}" | Price: "{formData.price}"<br/>
            Form valid: {formData.name && formData.category && formData.price ? 'Yes' : 'No'}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  required
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="timber">Timber</option>
                  <option value="furniture">Furniture</option>
                  <option value="construction">Construction</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Featured Type</label>
                <select
                  name="featuredType"
                  value={formData.featuredType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="none">Not Featured</option>
                  <option value="best">Best Seller</option>
                  <option value="new">New Arrival</option>
                  <option value="discount">Discount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Size</label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter product size"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="0"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="pieces">Pieces</option>
                  <option value="cubic ft">Cubic ft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter price"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter product description"
              />
            </div>

            {/* Category-specific attributes */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">
                {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)} Attributes
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {renderCategoryFields()}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Images</h4>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                  <div className="grid grid-cols-5 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={(() => {
                            if (image.url) {
                              return image.url;
                            }
                            if (image.data) {
                              if (image.data.startsWith('data:')) {
                                return image.data;
                              }
                              return `data:${image.contentType || 'image/jpeg'};base64,${image.data}`;
                            }
                            return 'https://via.placeholder.com/96x96/f3f4f6/9ca3af?text=No+Image';
                          })()}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image.public_id || image.filename)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEdit ? 'Add More Images' : 'Upload Images'}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 5 images total. Selected: {selectedFiles.length}
                </p>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Images</label>
                  <div className="grid grid-cols-5 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md"
              >
                {uploading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

