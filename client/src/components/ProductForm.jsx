import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNotification } from './NotificationProvider';

export default function ProductForm({ product, defaultCategory, onClose, onSuccess }) {
  const isEdit = !!product;
  const { showSuccess, showError } = useNotification();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'timber',
    subcategory: '',
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
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

  // Custom categories state
  const [customCategories, setCustomCategories] = useState({ furniture: [], timber: [], construction: [] });

  // Default Timber subcategories
  const defaultTimberSubcategories = [
    { value: 'planks', label: 'Planks' },
    { value: 'beams', label: 'Beams' },
    { value: 'billet', label: 'Billet' },
    { value: 'venners', label: 'Venners' },
    { value: 'board_and_slabs', label: 'Board & Slabs' },
    { value: 'laths', label: 'Laths' },
    { value: 'stumps_blocks', label: 'Stumps & Blocks' }
  ];

  // Default Furniture subcategories
  const defaultFurnitureSubcategories = [
    { value: 'study table', label: 'Study Table' },
    { value: 'dining table', label: 'Dining Table' },
    { value: 'chairs', label: 'Chairs' },
    { value: 'bed', label: 'Bed' },
    { value: 'bookshelf', label: 'Bookshelf' }
  ];

  // Default Construction subcategories (if any)
  const defaultConstructionSubcategories = [];

  // Load custom categories on mount and when form opens
  useEffect(() => {
    const loadCategories = () => {
      try {
        const saved = localStorage.getItem('admin_custom_categories');
        if (saved) {
          setCustomCategories(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading custom categories:', error);
      }
    };

    loadCategories();

    // Listen for custom category updates
    const handleCategoryUpdate = () => {
      loadCategories();
    };

    window.addEventListener('customCategoriesUpdated', handleCategoryUpdate);
    
    return () => {
      window.removeEventListener('customCategoriesUpdated', handleCategoryUpdate);
    };
  }, [isEdit, product]);

  // Merge default and custom categories (computed values)
  const timberSubcategories = [
    { value: '', label: 'Select Timber Type' },
    ...defaultTimberSubcategories,
    ...(customCategories.timber || [])
  ];

  const furnitureSubcategories = [
    { value: '', label: 'Select Furniture Type' },
    ...defaultFurnitureSubcategories,
    ...(customCategories.furniture || [])
  ];

  const constructionSubcategories = [
    { value: '', label: 'Select Construction Type' },
    ...defaultConstructionSubcategories,
    ...(customCategories.construction || [])
  ];

  // Category-specific attribute configurations
  const categoryAttributes = {
    timber: {
      woodType: '',
      length: '',
      width: '',
      thickness: '',
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
    if (isEdit && product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'timber',
        subcategory: product.subcategory || '',
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
        category: defaultCategory || 'timber',
        subcategory: '',
        quantity: '',
        unit: 'pieces',
        price: '',
        size: '',
        description: '',
        attributes: categoryAttributes[defaultCategory || 'timber'] || categoryAttributes.timber,
        featuredType: 'none'
      });
    }
  }, [product, isEdit, defaultCategory]);

  // Update attributes when category changes
  useEffect(() => {
    if (!isEdit || !product) {
      setFormData(prev => ({
        ...prev,
        category: (defaultCategory === 'timber' || defaultCategory === 'furniture') ? defaultCategory : prev.category,
        attributes: categoryAttributes[(defaultCategory === 'timber' || defaultCategory === 'furniture') ? defaultCategory : prev.category] || {}
      }));
    }
  }, [formData.category, defaultCategory]);

  // Real-time validation functions
  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'name':
        if (!value || value.trim() === '') {
          errors.name = 'Product name is required';
        } else if (value.trim().length < 3) {
          errors.name = 'Product name must be at least 3 characters long';
        } else if (value.trim().length > 100) {
          errors.name = 'Product name must not exceed 100 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errors.name = 'Product name can only contain alphabets (letters) and spaces';
        } else {
          delete errors.name;
        }
        break;
        
      case 'price':
        if (!value || value === '') {
          errors.price = 'Price is required';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          errors.price = 'Price must be a positive number';
        } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          errors.price = 'Price must be a valid number (decimal with max 2 places allowed)';
        } else if (parseFloat(value) > 1000000) {
          errors.price = 'Price cannot exceed ₹10,00,000';
        } else {
          delete errors.price;
        }
        break;
        
      case 'quantity':
        if (value === '' || value === null || value === undefined) {
          errors.quantity = 'Quantity is required';
        } else if (isNaN(value) || parseInt(value) < 0) {
          errors.quantity = 'Quantity must be a non-negative number';
        } else if (parseInt(value) > 10000) {
          errors.quantity = 'Quantity cannot exceed 10,000 units';
        } else {
          delete errors.quantity;
        }
        break;
        
      case 'size':
        if (defaultCategory === 'timber' || defaultCategory === 'construction') {
          // Size is required for timber and construction products
          if (!value || value.trim() === '') {
            errors.size = 'Size/dimensions are required for this product type';
          } else if (value.trim().length > 50) {
            errors.size = 'Size description must not exceed 50 characters';
          } else {
            delete errors.size;
          }
        } else {
          // Size is optional for furniture but has length limit
          if (value && value.trim().length > 50) {
            errors.size = 'Size description must not exceed 50 characters';
          } else {
            delete errors.size;
          }
        }
        break;
        
      case 'description':
        if (!value || value.trim() === '') {
          errors.description = 'Product description is required';
        } else if (value.trim().length < 10) {
          errors.description = 'Description must be at least 10 characters long';
        } else if (value.trim().length > 1000) {
          errors.description = 'Description must not exceed 1000 characters';
        } else {
          delete errors.description;
        }
        break;
        
      case 'subcategory':
        if (!value || value.trim() === '') {
          errors.subcategory = `${defaultCategory === 'timber' ? 'Timber' : 'Furniture'} category is required`;
        } else {
          delete errors.subcategory;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    validateField(name, value);
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    // Validate on blur to ensure validation is triggered
    validateField(name, value);
  };

  const handleAttributeChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value
      }
    }));
    
    // Validate attribute fields
    const errors = { ...validationErrors };
    
    if (key === 'woodType') {
      if (!value || value.trim() === '') {
        errors.woodType = 'Wood type is required';
      } else if (value.trim().length > 30) {
        errors.woodType = 'Wood type must not exceed 30 characters';
      } else {
        delete errors.woodType;
      }
    } else if (key === 'grade') {
      if (!value || value.trim() === '') {
        errors.grade = 'Grade is required';
      } else if (!['A', 'A+', 'B', 'C'].includes(value.trim())) {
        errors.grade = 'Grade must be A, A+, B, or C';
      } else {
        delete errors.grade;
      }
    } else if (['length', 'width', 'thickness'].includes(key)) {
      if (value && value !== '') {
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} must be a numeric value (decimal with max 2 places allowed)`;
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} must be a positive number`;
        } else if (parseFloat(value) > 1000) {
          errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} cannot exceed 1000`;
        } else {
          delete errors[key];
        }
      } else {
        delete errors[key];
      }
    } else if (key === 'material') {
      if (!value || value.trim() === '') {
        errors.material = 'Material is required';
      } else if (value.trim().length > 50) {
        errors.material = 'Material must not exceed 50 characters';
      } else {
        delete errors.material;
      }
    } else if (key === 'polish') {
      if (!value || value.trim() === '') {
        errors.polish = 'Polish type is required';
      } else if (value.trim().length > 50) {
        errors.polish = 'Polish type must not exceed 50 characters';
      } else {
        delete errors.polish;
      }
    } else if (key === 'finish') {
      if (defaultCategory === 'construction') {
        if (!value || value.trim() === '') {
          errors.finish = 'Finish type is required';
        } else if (value.trim().length > 50) {
          errors.finish = 'Finish description must not exceed 50 characters';
        } else {
          delete errors.finish;
        }
      } else {
        if (value && value.trim().length > 50) {
          errors.finish = 'Finish description must not exceed 50 characters';
        } else {
          delete errors.finish;
        }
      }
    } else if (key === 'style') {
      if (!value || value.trim() === '') {
        errors.style = 'Style is required';
      } else if (value.trim().length > 50) {
        errors.style = 'Style description must not exceed 50 characters';
      } else {
        delete errors.style;
      }
    } else if (key === 'productType') {
      if (!value || value.trim() === '') {
        errors.productType = 'Product type is required';
      } else if (value.trim().length > 50) {
        errors.productType = 'Product type must not exceed 50 characters';
      } else {
        delete errors.productType;
      }
    } else if (key === 'size' && defaultCategory === 'construction') {
      if (!value || value.trim() === '') {
        errors.constructionSize = 'Size/dimensions are required for construction materials';
      } else if (value.trim().length > 50) {
        errors.constructionSize = 'Size must not exceed 50 characters';
      } else {
        delete errors.constructionSize;
      }
    } else if (key === 'usage') {
      if (!value || value.trim() === '') {
        errors.usage = 'Usage information is required';
      } else if (value.trim().length > 100) {
        errors.usage = 'Usage description must not exceed 100 characters';
      } else {
        delete errors.usage;
      }
    } else {
      delete errors[key];
    }
    
    setValidationErrors(errors);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5 - existingImages.length + imagesToRemove.length;
    
    // Check if too many files selected
    if (files.length > maxFiles) {
      showError(`You can only select up to ${maxFiles} more images (maximum 5 total)`);
      e.target.value = ''; // Reset file input
      return;
    }
    
    // Validate file types - only PNG and JPG allowed
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type.toLowerCase()));
    
    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map(f => f.name).join(', ');
      showError(`Invalid file format! Only PNG and JPG images are allowed. Invalid files: ${invalidFileNames}`);
      e.target.value = ''; // Reset file input
      return;
    }
    
    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      const oversizedFileNames = oversizedFiles.map(f => f.name).join(', ');
      showError(`File size too large! Maximum 5MB per image. Oversized files: ${oversizedFileNames}`);
      e.target.value = ''; // Reset file input
      return;
    }
    
    // All validations passed
    setSelectedFiles(files);
    showSuccess(`${files.length} image(s) selected successfully`);
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
    
    // Comprehensive validation for all fields
    const errors = [];
    
    // Product Name Validation
    if (!formData.name || formData.name.trim() === '') {
      errors.push('Product name is required');
    } else if (formData.name.trim().length < 3) {
      errors.push('Product name must be at least 3 characters long');
    } else if (formData.name.trim().length > 100) {
      errors.push('Product name must not exceed 100 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      errors.push('Product name can only contain alphabets (letters) and spaces - no numbers or special characters');
    }
    
    // Category/Subcategory Validation
    if (defaultCategory === 'timber' || defaultCategory === 'furniture') {
      if (!formData.subcategory || formData.subcategory.trim() === '') {
        errors.push(`${defaultCategory === 'timber' ? 'Timber' : 'Furniture'} category is required`);
      }
    } else {
      if (!formData.category || formData.category.trim() === '') {
        errors.push('Category is required');
      }
    }
    
    // Price Validation
    if (!formData.price || formData.price === '') {
      errors.push('Price is required');
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.push('Price must be a positive number');
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price.toString())) {
      errors.push('Price must be a valid number (decimal with max 2 places allowed)');
    } else if (parseFloat(formData.price) > 1000000) {
      errors.push('Price cannot exceed ₹10,00,000');
    }
    
    // Quantity Validation
    if (formData.quantity === '' || formData.quantity === null || formData.quantity === undefined) {
      errors.push('Quantity is required');
    } else if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
      errors.push('Quantity must be a non-negative number');
    } else if (parseInt(formData.quantity) > 10000) {
      errors.push('Quantity cannot exceed 10,000 units');
    }
    
    // Unit Validation
    if (!formData.unit || formData.unit.trim() === '') {
      errors.push('Unit is required');
    }
    
    // Size Validation
    if (defaultCategory === 'timber' || defaultCategory === 'construction') {
      // Size is required for timber and construction products
      if (!formData.size || formData.size.trim() === '') {
        errors.push('Size/dimensions are required for timber and construction products');
      } else if (formData.size.trim().length > 50) {
        errors.push('Size description must not exceed 50 characters');
      }
    } else {
      // Size is optional for furniture but has length limit
      if (formData.size && formData.size.trim().length > 50) {
        errors.push('Size description must not exceed 50 characters');
      }
    }
    
    // Description Validation
    if (!formData.description || formData.description.trim() === '') {
      errors.push('Product description is required');
    } else if (formData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    } else if (formData.description.trim().length > 1000) {
      errors.push('Description must not exceed 1000 characters');
    }
    
    // Image Validation
    if (!isEdit) {
      // For new products, at least one image is required
      if (selectedFiles.length === 0) {
        errors.push('At least one product image is required');
      }
    } else {
      // For editing products, ensure at least one image exists (existing or new)
      const totalImages = existingImages.length + selectedFiles.length - imagesToRemove.length;
      if (totalImages === 0) {
        errors.push('At least one product image is required');
      }
    }
    
    // Category-specific validations
    if (defaultCategory === 'timber') {
      // Timber-specific validations
      const timberAttrs = formData.attributes || {};
      
      // Wood Type Validation
      if (!timberAttrs.woodType || timberAttrs.woodType.trim() === '') {
        errors.push('Wood type is required for timber products');
      } else if (timberAttrs.woodType.trim().length > 30) {
        errors.push('Wood type must not exceed 30 characters');
      }
      
      // Grade Validation
      if (!timberAttrs.grade || timberAttrs.grade.trim() === '') {
        errors.push('Grade is required for timber products');
      } else if (!['A', 'A+', 'B', 'C'].includes(timberAttrs.grade.trim())) {
        errors.push('Grade must be A, A+, B, or C');
      }
      
      // Dimensions Validation
      const dimensions = ['length', 'width', 'thickness'];
      dimensions.forEach(dim => {
        const value = timberAttrs[dim];
        if (value && value !== '') {
          if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
            errors.push(`${dim.charAt(0).toUpperCase() + dim.slice(1)} must be a numeric value (decimal with max 2 places allowed)`);
          } else if (isNaN(value) || parseFloat(value) <= 0) {
            errors.push(`${dim.charAt(0).toUpperCase() + dim.slice(1)} must be a positive number`);
          } else if (parseFloat(value) > 1000) {
            errors.push(`${dim.charAt(0).toUpperCase() + dim.slice(1)} cannot exceed 1000`);
          }
        }
      });
      
    } else if (defaultCategory === 'furniture') {
      // Furniture-specific validations
      const furnitureAttrs = formData.attributes || {};
      
      // Material Validation (if present in attributes)
      if (!furnitureAttrs.material || furnitureAttrs.material.trim() === '') {
        errors.push('Material is required for furniture products');
      } else if (furnitureAttrs.material.trim().length > 50) {
        errors.push('Material must not exceed 50 characters');
      }
      
      // Polish Validation (if present in attributes)
      if (!furnitureAttrs.polish || furnitureAttrs.polish.trim() === '') {
        errors.push('Polish type is required for furniture products');
      } else if (furnitureAttrs.polish.trim().length > 50) {
        errors.push('Polish type must not exceed 50 characters');
      }
      
      // Finish Validation
      if (furnitureAttrs.finish && furnitureAttrs.finish.trim().length > 50) {
        errors.push('Finish description must not exceed 50 characters');
      }
      
      // Style Validation
      if (!furnitureAttrs.style || furnitureAttrs.style.trim() === '') {
        errors.push('Style is required for furniture products');
      } else if (furnitureAttrs.style.trim().length > 50) {
        errors.push('Style description must not exceed 50 characters');
      }
      
    } else if (defaultCategory === 'construction') {
      // Construction-specific validations
      const constructionAttrs = formData.attributes || {};
      
      // Product Type Validation
      if (!constructionAttrs.productType || constructionAttrs.productType.trim() === '') {
        errors.push('Product type is required for construction materials');
      } else if (constructionAttrs.productType.trim().length > 50) {
        errors.push('Product type must not exceed 50 characters');
      }
      
      // Size Validation
      if (!constructionAttrs.size || constructionAttrs.size.trim() === '') {
        errors.push('Size/dimensions are required for construction materials');
      } else if (constructionAttrs.size.trim().length > 50) {
        errors.push('Size must not exceed 50 characters');
      }
      
      // Finish Validation
      if (!constructionAttrs.finish || constructionAttrs.finish.trim() === '') {
        errors.push('Finish type is required for construction materials');
      } else if (constructionAttrs.finish.trim().length > 50) {
        errors.push('Finish description must not exceed 50 characters');
      }
      
      // Usage Validation
      if (!constructionAttrs.usage || constructionAttrs.usage.trim() === '') {
        errors.push('Usage information is required for construction materials');
      } else if (constructionAttrs.usage.trim().length > 100) {
        errors.push('Usage description must not exceed 100 characters');
      }
    }
    
    if (errors.length > 0) {
      showError('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    setUploading(true);

    try {
      const submitData = new FormData();
      
      // Add form fields
      submitData.append('name', formData.name.trim());
      
      // For timber and furniture products, use subcategory as the main category
      if (defaultCategory === 'timber' || defaultCategory === 'furniture') {
        submitData.append('category', defaultCategory);
        if (formData.subcategory) {
          submitData.append('subcategory', formData.subcategory);
        }
      } else {
        submitData.append('category', formData.category);
      }
      
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

      console.log('Submitting product data:', {
        isEdit,
        productId: isEdit ? product._id : 'new',
        formData: {
          name: formData.name,
          category: defaultCategory,
          subcategory: formData.subcategory,
          price: formData.price,
          quantity: formData.quantity
        }
      });

      if (isEdit) {
        // Update existing product
        console.log(`Updating product ${product._id}...`);
        const response = await api.put(`/products/${product._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Update response:', response.data);
      } else {
        // Create new product
        console.log('Creating new product...');
        const response = await api.post('/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Create response:', response.data);
      }

      showSuccess(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
      onSuccess();
    } catch (error) {
      console.error('Product submission error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} product`;
      showError(`Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const renderCategoryFields = () => {
    const fields = categoryAttributes[formData.category] || {};
    
    return Object.keys(fields).map(key => {
      // Special handling for timber dimensions
      if (formData.category === 'timber' && ['length', 'width', 'thickness'].includes(key)) {
        const unit = key === 'thickness' ? 'inches' : 'ft';
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        
        return (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">
              {label} ({unit}) <span className="text-xs text-gray-500">(Numeric only)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.attributes[key] || ''}
              onChange={(e) => handleAttributeChange(key, e.target.value)}
              onBlur={(e) => handleAttributeChange(key, e.target.value)}
              className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                validationErrors[key] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder={`Enter ${label.toLowerCase()} (e.g., 12.5)`}
            />
            {validationErrors[key] && (
              <p className="mt-1 text-sm text-red-600">{validationErrors[key]}</p>
            )}
          </div>
        );
      }
      
      // Default handling for other fields
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      const isRequired = ['woodType', 'grade', 'material', 'polish', 'style', 'productType', 'finish', 'usage', 'size'].includes(key);
      const errorKey = (key === 'size' && formData.category === 'construction') ? 'constructionSize' : key;
      
      return (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 capitalize">
            {label} {isRequired && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={formData.attributes[key] || ''}
            onChange={(e) => handleAttributeChange(key, e.target.value)}
            onBlur={(e) => handleAttributeChange(key, e.target.value)}
            className={`mt-1 block w-full border rounded-md px-3 py-2 ${
              validationErrors[errorKey] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
          {validationErrors[errorKey] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors[errorKey]}</p>
          )}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name * <span className="text-xs text-gray-500">(Letters only)</span></label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                    validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Enter product name (letters and spaces only)"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>
            {/* Category selection - different for timber vs furniture vs other products */}
            {defaultCategory === 'timber' ? (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timber Category *</label>
                  <select
                    required
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                      validationErrors.subcategory ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  >
                    {timberSubcategories.filter(sub => sub.value !== '').map((subcategory) => (
                      <option key={subcategory.value} value={subcategory.value}>
                        {subcategory.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.subcategory && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.subcategory}</p>
                  )}
                </div>
              </div>
            ) : defaultCategory === 'furniture' ? (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Furniture Category *</label>
                  <select
                    required
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                      validationErrors.subcategory ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  >
                    {furnitureSubcategories.filter(sub => sub.value !== '').map((subcategory) => (
                      <option key={subcategory.value} value={subcategory.value}>
                        {subcategory.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.subcategory && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.subcategory}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
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
            )}

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
                <label className="block text-sm font-medium text-gray-700">
                  Size {(defaultCategory === 'timber' || defaultCategory === 'construction') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                    validationErrors.size ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Enter product size"
                />
                {validationErrors.size && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.size}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                <input
                  type="number"
                  min="0"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                    validationErrors.quantity ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Enter quantity"
                />
                {validationErrors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.quantity}</p>
                )}
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
                <label className="block text-sm font-medium text-gray-700">Price * <span className="text-xs text-gray-500">(Decimals allowed)</span></label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                    validationErrors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Enter price (e.g., 5000.50)"
                />
                {validationErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                rows={3}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                  validationErrors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Enter product description (minimum 10 characters)"
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              )}
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
                  accept="image/png, image/jpeg, image/jpg, .png, .jpg, .jpeg"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Allowed formats:</span> PNG, JPG, JPEG only
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">File size:</span> Maximum 5MB per image
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Total images:</span> Maximum 5 images | Selected: {selectedFiles.length}
                  </p>
                </div>
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

