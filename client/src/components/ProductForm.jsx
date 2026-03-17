import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNotification } from './NotificationProvider';

const FURNITURE_TYPES = {
  Chair: ['Arm Chair', 'Dining Chair', 'Office Chair', 'Rocking Chair', 'Recliner'],
  Table: ['Study Table', 'Coffee Table', 'Side Table', 'Console Table', 'Dining Table', 'Bedside Table'],
  Bed: ['Single Bed', 'Double Bed', 'Queen Bed', 'King Bed', 'Bunk Bed', 'Storage Bed'],
  Sofa: ['2 Seater Sofa', '3 Seater Sofa', 'L Shape Sofa', 'Recliner Sofa', 'Sofa Cum Bed'],
  Storage: ['Wardrobe', 'Cabinet', 'Cupboard', 'Bookshelf', 'Display Shelf', 'TV Unit', 'Shoe Rack'],
  Others: ['Bench', 'Stool', 'Dressing Table', 'Study Desk', 'Bar Cabinet']
};

const MATERIALS = ['Solid Wood', 'Teak Wood', 'Oak Wood', 'Mahogany', 'Rosewood', 'Pine Wood', 'Engineered Wood'];
const POLISHES = ['Natural Finish', 'Matte Finish', 'Glossy Finish', 'Semi Gloss', 'Teak Finish', 'Walnut Finish', 'Mahogany Finish', 'Honey Finish', 'Dark Brown Finish', 'Black Finish', 'White Finish'];
const STYLES = ['Modern', 'Contemporary', 'Traditional', 'Classic', 'Minimalist', 'Rustic', 'Industrial', 'Vintage', 'Scandinavian', 'Bohemian', 'Luxury', 'Mid Century Modern'];

const UPHOLSTERED_FURNITURE_TYPES = [
  '2 Seater Sofa', '3 Seater Sofa', 'L Shape Sofa', 'Recliner Sofa', 'Sofa Cum Bed',
  'Arm Chair', 'Office Chair', 'Recliner'
];
const UPHOLSTERY_MATERIALS = ['Fabric', 'Leather', 'PU Leather', 'Velvet', 'Linen', 'Microfiber', 'Suede'];
const FABRIC_TYPES = ['Cotton', 'Linen', 'Velvet', 'Polyester', 'Microfiber', 'Chenille', 'Jacquard'];
const FOAM_DENSITIES = ['Medium Density', 'High Density', 'Premium High Density', 'Memory Foam', 'HR Foam'];
const CUSHION_TYPES = ['Fixed Cushion', 'Loose Cushion', 'Foam Cushion', 'Fiber Cushion', 'Foam + Fiber Cushion', 'Spring Cushion'];
const REMOVABLE_COVERS = ['Yes', 'No'];
const UPHOLSTERY_COLORS = [
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Black', hex: '#000000' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Beige', hex: '#F5F5DC', border: true },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Mustard Yellow', hex: '#FFDB58' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Cream', hex: '#FFFDD0', border: true }
];

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
    featuredType: 'none',
    productType: 'ready-stock',
    customizationOptions: {
      woodTypes: '',
      estimatedProductionTime: '',
      basePrice: ''
    },
    warrantyIncluded: false,
    warrantyMonths: 0
  });

  // Image state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [coverIndex, setCoverIndex] = useState(0);

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

  // Custom categories state
  const [customCategories, setCustomCategories] = useState({ furniture: [], timber: [], construction: [] });

  // Custom attributes state (furniture dropdowns)
  const [customAttributeModes, setCustomAttributeModes] = useState({
    furnitureCategory: false, furnitureType: false, material: false, polish: false, style: false,
    upholsteryMaterial: false, fabricType: false, foamDensity: false, cushionType: false, removableCover: false
  });
  const [customAttributesList, setCustomAttributesList] = useState({
    furnitureCategory: [], furnitureType: [], material: [], polish: [], style: [],
    upholsteryMaterial: [], fabricType: [], foamDensity: [], cushionType: [], removableCover: []
  });

  const toggleCustomMode = (key, isCustom) => {
    setCustomAttributeModes(prev => ({ ...prev, [key]: isCustom }));
    // Note: handleAttributeChange comes further down, but we will reference it inline or define a wrapper if needed.
  };

  const addCustomAttribute = (key, value) => {
    if (!value || !value.trim()) return;
    const trimmedValue = value.trim();
    setCustomAttributesList(prev => {
      if (prev[key] && prev[key].includes(trimmedValue)) return prev;
      const updatedList = { ...prev, [key]: [...(prev[key] || []), trimmedValue] };
      localStorage.setItem('admin_custom_attributes', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('customCategoriesUpdated'));
      return updatedList;
    });
  };

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
    { value: 'seating', label: 'Seating Furniture' },
    { value: 'tables', label: 'Tables' },
    { value: 'bedroom', label: 'Bedroom Furniture' },
    { value: 'storage', label: 'Storage Furniture' },
    { value: 'living', label: 'Living Room Furniture' },
    { value: 'dining', label: 'Dining Room Furniture' },
    { value: 'office', label: 'Office Furniture' },
    { value: 'outdoor', label: 'Outdoor Furniture' },
    { value: 'kids', label: 'Kids Furniture' },
    { value: 'custom_designs', label: 'Custom Furniture' }
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
        const savedAttr = localStorage.getItem('admin_custom_attributes');
        if (savedAttr) {
          setCustomAttributesList(JSON.parse(savedAttr));
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
    ...(customCategories.furniture || []).map(cat => ({
      value: cat.value || cat.toLowerCase().replace(/\s+/g, '_'),
      label: cat.label || cat
    }))
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
        featuredType: product.featuredType || 'none',
        productType: product.productType || 'ready-stock',
        customizationOptions: {
          woodTypes: product.customizationOptions?.woodTypes?.join(', ') || '',
          estimatedProductionTime: product.customizationOptions?.estimatedProductionTime || '',
          basePrice: product.customizationOptions?.basePrice || ''
        },
        warrantyIncluded: product.warrantyIncluded || false,
        warrantyMonths: product.warrantyMonths || 0
      });
      setExistingImages(product.images || []);
      const imgs = product.images || [];
      const coverI = imgs.findIndex((img) => img.isCover);
      setCoverIndex(coverI >= 0 ? coverI : 0);
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
        featuredType: 'none',
        productType: 'ready-stock',
        customizationOptions: {
          woodTypes: '',
          estimatedProductionTime: '',
          basePrice: ''
        },
        warrantyIncluded: false,
        warrantyMonths: 0
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
    if (name.startsWith('custom_')) {
      const fieldName = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        customizationOptions: {
          ...prev.customizationOptions,
          [fieldName]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Real-time validation
      validateField(name, value);
    }
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

  const handleFileSelect = async (e, color = 'base') => {
    const files = Array.from(e.target.files);

    // Calculate current images for THIS color
    const existingColorCount = existingImages.filter(img => (img.color || 'base') === color).length;
    const toRemoveColorCount = imagesToRemove.filter(id => {
      const img = existingImages.find(i => (i.public_id || i.filename) === id);
      return img && (img.color || 'base') === color;
    }).length;
    const selectedColorCount = selectedFiles.filter(item => item.color === color).length;

    const maxFiles = 5 - existingColorCount + toRemoveColorCount - selectedColorCount;

    // Check if too many files selected
    if (files.length > maxFiles) {
      showError(`You can only select up to ${maxFiles} more image(s) for ${color === 'base' ? 'this product' : color} (maximum 5 total per color)`);
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
    const newFiles = files.map(file => ({ file, color }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
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
    if (formData.productType !== 'made-to-order') {
      if (formData.quantity === '' || formData.quantity === null || formData.quantity === undefined) {
        errors.push('Quantity is required');
      } else if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
        errors.push('Quantity must be a non-negative number');
      } else if (parseInt(formData.quantity) > 10000) {
        errors.push('Quantity cannot exceed 10,000 units');
      }
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

      submitData.append('quantity', formData.productType === 'made-to-order' ? 0 : (formData.quantity || 0));
      submitData.append('unit', formData.unit);
      submitData.append('price', formData.price);
      submitData.append('size', formData.size || '');
      submitData.append('description', formData.description || '');
      submitData.append('attributes', JSON.stringify(formData.attributes || {}));
      submitData.append('featuredType', formData.featuredType);
      submitData.append('productType', formData.productType);

      const customOpts = {
        woodTypes: formData.customizationOptions.woodTypes.split(',').map(s => s.trim()).filter(Boolean),
        estimatedProductionTime: formData.customizationOptions.estimatedProductionTime,
      };
      submitData.append('customizationOptions', JSON.stringify(customOpts));
      // Warranty only for Furniture and Construction; Timber products always no warranty
      if (defaultCategory === 'timber') {
        submitData.append('warrantyIncluded', 'false');
        submitData.append('warrantyMonths', '0');
      } else {
        submitData.append('warrantyIncluded', formData.warrantyIncluded ? 'true' : 'false');
        submitData.append('warrantyMonths', formData.warrantyIncluded ? String(Math.min(120, Math.max(1, parseInt(formData.warrantyMonths, 10) || 0))) : '0');
      }

      // Add new images securely (supports both old File array state and new obj array state)
      selectedFiles.forEach(item => {
        const fileObj = item.file ? item.file : item;
        const colorVal = item.color ? item.color : 'base';
        submitData.append('images', fileObj);
        submitData.append('imageColors', colorVal);
      });

      // Cover image index: when we have new files it's index in selectedFiles; otherwise index in existing (for update)
      const effectiveCoverIndex = selectedFiles.length > 0
        ? Math.min(coverIndex, selectedFiles.length - 1)
        : Math.min(coverIndex, Math.max(0, existingImages.length - imagesToRemove.length - 1));
      submitData.append('coverIndex', String(effectiveCoverIndex));

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
    let fields = { ...(categoryAttributes[formData.category] || {}) };

    if (formData.category === 'furniture') {
      const type = formData.attributes.furnitureType;
      const requiresUpholstery = UPHOLSTERED_FURNITURE_TYPES.includes(type);

      if (requiresUpholstery) {
        fields = {
          ...fields,
          upholsteryColors: [],
          upholsteryMaterial: '',
          fabricType: '',
          foamDensity: '',
          cushionType: '',
          removableCover: ''
        };
      }
    }

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
              className={`mt-1 block w-full border rounded-md px-3 py-2 ${validationErrors[key] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              placeholder={`Enter ${label.toLowerCase()} (e.g., 12.5)`}
            />
            {validationErrors[key] && (
              <p className="mt-1 text-sm text-red-600">{validationErrors[key]}</p>
            )}
          </div>
        );
      }

      // Handle multi-select for Upholstery Colors
      if (key === 'upholsteryColors') {
        const selectedColors = Array.isArray(formData.attributes.upholsteryColors) ? formData.attributes.upholsteryColors : [];
        const toggleColor = (color) => {
          let newColors = [...selectedColors];
          if (newColors.includes(color)) {
            newColors = newColors.filter(c => c !== color);
          } else {
            newColors.push(color);
          }
          handleAttributeChange('upholsteryColors', newColors);
        };

        return (
          <div key={key} className="col-span-2 mt-2 border p-4 rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available Upholstery Colors
            </label>
            <div className="flex flex-wrap gap-3 mt-2">
              {UPHOLSTERY_COLORS.map(colorObj => {
                const isSelected = selectedColors.includes(colorObj.name);
                return (
                  <button
                    type="button"
                    key={colorObj.name}
                    onClick={() => toggleColor(colorObj.name)}
                    className={`group relative flex items-center gap-2.5 p-1.5 pr-4 rounded-full text-sm font-medium border transition-all duration-200 shadow-sm ${isSelected
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-900 scale-[1.02]'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:scale-[1.02]'
                      }`}
                  >
                    <div
                      className={`relative flex items-center justify-center w-7 h-7 rounded-full shadow-inner ${colorObj.border ? 'border border-gray-200' : ''}`}
                      style={{ backgroundColor: colorObj.hex }}
                    >
                      {isSelected && (
                        <svg
                          className={`w-4 h-4 ${['White', 'Cream', 'Beige', 'Mustard Yellow'].includes(colorObj.name) ? 'text-gray-800' : 'text-white'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {colorObj.name}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Selected colors will create corresponding image upload zones below.
            </p>
          </div>
        );
      }

      // Default handling for other fields
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      const isRequired = ['woodType', 'grade', 'material', 'polish', 'style', 'productType', 'finish', 'usage', 'size'].includes(key);
      const errorKey = (key === 'size' && formData.category === 'construction') ? 'constructionSize' : key;

      const isFurnitureDropdown = formData.category === 'furniture' &&
        ['furnitureType', 'material', 'polish', 'style', 'upholsteryMaterial', 'fabricType', 'foamDensity', 'cushionType', 'removableCover'].includes(key);

      if (isFurnitureDropdown) {
        let options = [];
        if (key === 'furnitureType') {
          options = Object.entries(FURNITURE_TYPES).map(([group, items]) => ({ group, items }));
        } else if (key === 'material') {
          options = MATERIALS;
        } else if (key === 'polish') {
          options = POLISHES;
        } else if (key === 'style') {
          options = STYLES;
        } else if (key === 'upholsteryMaterial') {
          options = UPHOLSTERY_MATERIALS;
        } else if (key === 'fabricType') {
          options = FABRIC_TYPES;
        } else if (key === 'foamDensity') {
          options = FOAM_DENSITIES;
        } else if (key === 'cushionType') {
          options = CUSHION_TYPES;
        } else if (key === 'removableCover') {
          options = REMOVABLE_COVERS;
        }

        const customOptions = customAttributesList[key] || [];

        return (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>

            {customAttributeModes[key] ? (
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder={`Enter custom ${label.toLowerCase()}`}
                  value={formData.attributes[key] || ''}
                  onChange={(e) => handleAttributeChange(key, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = formData.attributes[key];
                    if (val) addCustomAttribute(key, val);
                    toggleCustomMode(key, false);
                  }}
                  className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => toggleCustomMode(key, false)}
                  className="px-3 py-2 text-gray-500 text-sm font-medium rounded-md hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={formData.attributes[key] || ''}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    toggleCustomMode(key, true);
                  } else {
                    handleAttributeChange(key, e.target.value);
                  }
                }}
                className={`mt-1 block w-full border rounded-md px-3 py-2 bg-white ${validationErrors[errorKey] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
              >
                <option value="">Select {label}</option>
                {key === 'furnitureType' && (
                  <>
                    {options.map(opt => (
                      <optgroup key={opt.group} label={opt.group}>
                        {opt.items.map(item => <option key={item} value={item}>{item}</option>)}
                      </optgroup>
                    ))}
                    {customOptions.length > 0 && (
                      <optgroup label="Custom Options">
                        {customOptions.map(item => <option key={item} value={item}>{item}</option>)}
                      </optgroup>
                    )}
                  </>
                )}
                {key !== 'furnitureType' && (
                  <>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    {customOptions.length > 0 && (
                      <optgroup label="Custom Options">
                        {customOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </optgroup>
                    )}
                  </>
                )}
                <option value="__custom__" className="font-semibold text-blue-600">+ Add Custom {label}</option>
              </select>
            )}
            {validationErrors[errorKey] && (
              <p className="mt-1 text-sm text-red-600">{validationErrors[errorKey]}</p>
            )}
          </div>
        );
      }

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
            className={`mt-1 block w-full border rounded-md px-3 py-2 ${validationErrors[errorKey] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
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
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
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
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${validationErrors.subcategory ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
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
                    {customAttributeModes.furnitureCategory ? (
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 text-sm"
                          placeholder="Enter custom category"
                          value={formData.subcategory || ''}
                          onChange={(e) => handleInputChange({ target: { name: 'subcategory', value: e.target.value } })}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = formData.subcategory;
                            if (val) addCustomAttribute('furnitureCategory', val);
                            toggleCustomMode('furnitureCategory', false);
                          }}
                          className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCustomMode('furnitureCategory', false)}
                          className="px-3 py-2 text-gray-500 text-sm font-medium rounded-md hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <select
                        required
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setFormData(prev => ({ ...prev, subcategory: '' }));
                            toggleCustomMode('furnitureCategory', true);
                          } else {
                            handleInputChange(e);
                          }
                        }}
                        onBlur={handleInputBlur}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 bg-white ${validationErrors.subcategory ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      >
                        {furnitureSubcategories.map((subcategory, index) => (
                          <option key={subcategory.value || index} value={subcategory.value}>
                            {subcategory.label}
                          </option>
                        ))}
                        <option value="__custom__" className="font-semibold text-blue-600">+ Add Custom Category</option>
                      </select>
                    )}
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

              <div className="pt-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-900">Product List Type</label>
                  <span className="text-xs text-gray-500 font-medium">Controls required fields</span>
                </div>

                {/* Segmented Control / Pill Toggle */}
                <div className="bg-gray-100/80 p-1 rounded-xl flex items-center relative w-full sm:w-[400px]">
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: 'productType', value: 'ready-stock' } })}
                    className={`relative w-1/2 flex flex-col items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-all duration-200 z-10 ${formData.productType === 'ready-stock'
                      ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Ready Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: 'productType', value: 'made-to-order' } })}
                    className={`relative w-1/2 flex flex-col items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-all duration-200 z-10 ${formData.productType === 'made-to-order'
                      ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Made to Order
                  </button>
                </div>
              </div>

              {/* Dynamic Sections Based on Product Type */}
              {formData.productType === 'ready-stock' ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm ring-1 ring-gray-900/5 transition-all">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-5">
                    <div className="p-1.5 bg-gray-50 rounded-md border border-gray-200/60">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Inventory & Pricing</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Fixed physical stock ready for immediate delivery.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Quantity *</label>
                      <input
                        type="number"
                        min="0"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={`block w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors bg-gray-50/50 focus:bg-white ${validationErrors.quantity ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'}`}
                        placeholder="e.g. 50"
                      />
                      {validationErrors.quantity && <p className="mt-1.5 text-xs text-red-600 font-medium">{validationErrors.quantity}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Unit</label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm transition-colors bg-gray-50/50 focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                      >
                        <option value="pieces">Pieces</option>
                        <option value="cubic ft">Cubic ft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Price *</label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={`block w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors bg-gray-50/50 focus:bg-white ${validationErrors.price ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'}`}
                        placeholder="0.00"
                      />
                      {validationErrors.price && <p className="mt-1.5 text-xs text-red-600 font-medium">{validationErrors.price}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Size {(defaultCategory === 'timber' || defaultCategory === 'construction') && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={`block w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors bg-gray-50/50 focus:bg-white ${validationErrors.size ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'}`}
                        placeholder="e.g. 72x36x30 inches"
                      />
                      {validationErrors.size && <p className="mt-1.5 text-xs text-red-600 font-medium">{validationErrors.size}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Featured Status</label>
                      <select
                        name="featuredType"
                        value={formData.featuredType}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm transition-colors bg-gray-50/50 focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                      >
                        <option value="none">Standard Listing</option>
                        <option value="best">Best Seller</option>
                        <option value="new">New Arrival</option>
                        <option value="discount">Special Discount</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm ring-1 ring-gray-900/5 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full pointer-events-none opacity-50"></div>

                  <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-5 relative z-10">
                    <div className="p-1.5 bg-gray-50 rounded-md border border-gray-200/60">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Customization & Baseline Pricing</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Define reference designs for customer quotes.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative z-10">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Measurement Unit</label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm transition-colors bg-gray-50/50 focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                      >
                        <option value="pieces">Pieces</option>
                        <option value="cubic ft">Cubic ft</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Base Price (Starting At) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={`block w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors bg-gray-50/50 focus:bg-white ${validationErrors.price ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'}`}
                        placeholder="0.00"
                      />
                      {validationErrors.price && <p className="mt-1.5 text-xs text-red-600 font-medium">{validationErrors.price}</p>}
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Base Dimensions
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={`block w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors bg-gray-50/50 focus:bg-white ${validationErrors.size ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'}`}
                        placeholder="e.g. 72x36x30 inches"
                      />
                      {validationErrors.size && <p className="mt-1.5 text-xs text-red-600 font-medium">{validationErrors.size}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 relative z-10">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Allowable Wood Types</label>
                      <input
                        type="text"
                        name="custom_woodTypes"
                        value={formData.customizationOptions.woodTypes}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm transition-colors bg-gray-50/50 focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        placeholder="e.g. Teak, Oak, Pine"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Est. Production Time</label>
                      <input
                        type="text"
                        name="custom_estimatedProductionTime"
                        value={formData.customizationOptions.estimatedProductionTime}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm transition-colors bg-gray-50/50 focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        placeholder="e.g. 2-3 weeks"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 relative z-10">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Featured Status</label>
                      <select
                        name="featuredType"
                        value={formData.featuredType}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm transition-colors bg-gray-50/50 focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                      >
                        <option value="none">Standard Listing</option>
                        <option value="best">Best Seller</option>
                        <option value="new">New Arrival</option>
                        <option value="discount">Special Discount</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-lg flex gap-3 items-start mt-6 relative z-10">
                    <svg className="w-4 h-4 flex-shrink-0 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                      The dimensions provide a baseline. Use the <span className="text-gray-900 font-semibold text-xs uppercase tracking-widest">Description</span> below to explain custom modifications allowed for this piece.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  rows={3}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${validationErrors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
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

              {/* Image Upload zones per color */}
              <div className="space-y-6">
                <h4 className="text-md font-medium text-gray-900 line-clamp-1 border-b pb-2">Product Images</h4>

                {(() => {
                  const activeColors = ['base'];
                  if (formData.attributes && Array.isArray(formData.attributes.upholsteryColors)) {
                    formData.attributes.upholsteryColors.forEach(c => {
                      if (!activeColors.includes(c)) activeColors.push(c);
                    });
                  }

                  return activeColors.map(color => {
                    const colorImages = existingImages.filter(img => (img.color || 'base') === color);
                    const colorFiles = selectedFiles.filter(item => item.color === color);
                    const colorObj = UPHOLSTERY_COLORS.find(c => c.name === color);

                    return (
                      <div key={color} className="border rounded-lg p-4 bg-gray-50 space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          {colorObj && (
                            <span
                              className={`w-4 h-4 rounded-full inline-block shadow-inner ${colorObj.border ? 'border border-gray-300' : ''}`}
                              style={{ backgroundColor: colorObj.hex }}
                            ></span>
                          )}
                          <h5 className="text-sm font-semibold text-gray-800">
                            {color === 'base' ? 'Default Views' : `${color} Variant`}
                          </h5>
                        </div>

                        {/* Existing Images for this color */}
                        {colorImages.length > 0 && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">Current Images</label>
                            <div className="grid grid-cols-5 gap-3">
                              {colorImages.map((image, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={(() => {
                                      if (image.url) return image.url;
                                      if (image.data) {
                                        if (image.data.startsWith('data:')) return image.data;
                                        return `data:${image.contentType || 'image/jpeg'};base64,${image.data}`;
                                      }
                                      return 'https://via.placeholder.com/96x96/f3f4f6/9ca3af?text=No+Image';
                                    })()}
                                    alt={`${color} image ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-md border border-gray-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeExistingImage(image.public_id || image.filename)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-600 transition-colors"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* File Upload for this color */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            {isEdit ? 'Upload More Images' : 'Upload Images'}
                          </label>
                          <input
                            type="file"
                            multiple
                            accept="image/png, image/jpeg, image/jpg, .png, .jpg, .jpeg"
                            onChange={(e) => handleFileSelect(e, color)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors"
                          />
                          <p className="mt-1.5 text-xs text-gray-500">
                            Maximum 5 images total for this variant (Max 5MB each, JPG/PNG only).
                          </p>
                        </div>

                        {/* Selected Files Preview for this color */}
                        {colorFiles.length > 0 && (
                          <div className="pt-2">
                            <label className="block text-xs font-medium text-gray-600 mb-2">Files Ready to Upload</label>
                            <div className="grid grid-cols-5 gap-3">
                              {colorFiles.map((item, index) => {
                                // Find original index in selectedFiles array to remove correctly
                                const originalIndex = selectedFiles.findIndex(f => f === item);
                                return (
                                  <div key={index} className="relative">
                                    <img
                                      src={URL.createObjectURL(item.file)}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-20 object-cover rounded-md border border-blue-200 shadow-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeSelectedFile(originalIndex)}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-600 transition-colors"
                                    >
                                      ×
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Cover image: which image is shown on the product listing (e.g. /furniture). Detail page shows the rest. */}
            {(() => {
              const existingNotRemoved = existingImages.filter((img) => !imagesToRemove.includes(img.public_id || img.filename));
              const listToUse = selectedFiles.length > 0 ? selectedFiles : existingNotRemoved;
              const listLength = listToUse.length;
              if (listLength === 0) return null;
              const maxCover = listLength - 1;
              const safeCover = Math.min(Math.max(0, coverIndex), maxCover);
              return (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Cover image (listing)</h4>
                  <p className="text-xs text-gray-500 mb-3">This image is shown on the category listing (e.g. Furniture page). The product detail page shows the other images.</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedFiles.length > 0 ? (
                      selectedFiles.map((item, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(item.file)}
                            alt={`Preview ${index + 1}`}
                            className={`w-20 h-20 object-cover rounded-lg border-2 ${safeCover === index ? 'border-green-600 ring-2 ring-green-400' : 'border-gray-200'}`}
                          />
                          <button
                            type="button"
                            onClick={() => setCoverIndex(index)}
                            className={`mt-1 w-full text-xs py-1 rounded ${safeCover === index ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                          >
                            {safeCover === index ? '✓ Cover' : 'Set as cover'}
                          </button>
                        </div>
                      ))
                    ) : (
                      existingNotRemoved.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={(() => {
                              if (image.url) return image.url;
                              if (image.data) {
                                if (image.data.startsWith('data:')) return image.data;
                                return `data:${image.contentType || 'image/jpeg'};base64,${image.data}`;
                              }
                              return 'https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No+Image';
                            })()}
                            alt={`Image ${index + 1}`}
                            className={`w-20 h-20 object-cover rounded-lg border-2 ${safeCover === index ? 'border-green-600 ring-2 ring-green-400' : 'border-gray-200'}`}
                          />
                          <button
                            type="button"
                            onClick={() => setCoverIndex(index)}
                            className={`mt-1 w-full text-xs py-1 rounded ${safeCover === index ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                          >
                            {safeCover === index ? '✓ Cover' : 'Set as cover'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Warranty Settings - only for Furniture and Construction Materials, not Timber */}
            {(defaultCategory === 'furniture' || defaultCategory === 'construction') && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Warranty Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="warrantyIncluded"
                      checked={!!formData.warrantyIncluded}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          warrantyIncluded: checked,
                          warrantyMonths: checked ? (prev.warrantyMonths >= 1 ? prev.warrantyMonths : 1) : 0
                        }));
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="warrantyIncluded" className="ml-2 block text-sm text-gray-700">
                      Includes Warranty
                    </label>
                  </div>
                  {formData.warrantyIncluded && (
                    <div>
                      <label htmlFor="warrantyMonths" className="block text-sm font-medium text-gray-700">
                        Warranty Duration (months)
                      </label>
                      <input
                        type="number"
                        id="warrantyMonths"
                        min={1}
                        max={120}
                        value={formData.warrantyMonths || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          setFormData(prev => ({
                            ...prev,
                            warrantyMonths: isNaN(val) ? 0 : Math.min(120, Math.max(1, val))
                          }));
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Number of months of warranty from the date of purchase.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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

