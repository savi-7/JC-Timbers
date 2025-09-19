import Product from '../models/Product.js';
import { convertImageToBase64, cleanupTempFiles } from '../middleware/upload.js';

// Create new product with images
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      unit,
      price,
      size,
      description,
      attributes,
      featuredType
    } = req.body;

    // Validate required fields
    if (!name || !category || !price) {
      return res.status(400).json({
        message: 'Name, category, and price are required'
      });
    }

    // Validate category
    const validCategories = ['timber', 'furniture', 'construction'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: 'Invalid category. Must be timber, furniture, or construction'
      });
    }

    // Validate featuredType
    const validFeaturedTypes = ['best', 'new', 'discount', 'none'];
    if (featuredType && !validFeaturedTypes.includes(featuredType)) {
      return res.status(400).json({
        message: 'Invalid featuredType. Must be best, new, discount, or none'
      });
    }

    // Parse attributes if it's a string
    let parsedAttributes = {};
    if (attributes) {
      try {
        parsedAttributes = typeof attributes === 'string' 
          ? JSON.parse(attributes) 
          : attributes;
      } catch (error) {
        return res.status(400).json({
          message: 'Invalid attributes format'
        });
      }
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} uploaded images`);
      for (const file of req.files) {
        console.log('File details:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          filename: file.filename
        });
        
        // Convert image to base64
        const base64Data = convertImageToBase64(file.path);
        if (base64Data) {
          // Store as data URL for easier frontend handling
          const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
          images.push({
            data: dataUrl,
            contentType: file.mimetype,
            filename: file.originalname
          });
          console.log(`Image converted: ${file.originalname}, size: ${base64Data.length} chars`);
        } else {
          console.error(`Failed to convert image: ${file.originalname}`);
        }
      }
    }

    // Validate image count
    if (images.length > 5) {
      return res.status(400).json({
        message: 'Maximum 5 images allowed per product'
      });
    }

    // Create product
    console.log('Creating product with data:', {
      name: name.trim(),
      category: category.trim(),
      quantity: quantity ? parseInt(quantity) : 0,
      unit: unit || 'pieces',
      price: parseFloat(price),
      size: size ? size.trim() : undefined,
      description: description ? description.trim() : undefined,
      imagesCount: images.length,
      attributes: parsedAttributes
    });

    const product = new Product({
      name: name.trim(),
      category: category.trim(),
      quantity: quantity ? parseInt(quantity) : 0,
      unit: unit || 'pieces',
      price: parseFloat(price),
      size: size ? size.trim() : undefined,
      description: description ? description.trim() : undefined,
      images: images,
      attributes: parsedAttributes,
      featuredType: featuredType || 'none'
    });

    console.log('Saving product to database...');
    await product.save();
    console.log('Product saved successfully with ID:', product._id);

    // Clean up temporary files
    cleanupTempFiles(req.files);

    res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: product._id,
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        unit: product.unit,
        price: product.price,
        size: product.size,
        description: product.description,
        images: product.images.map(img => ({
          filename: img.filename,
          contentType: img.contentType,
          data: img.data.substring(0, 50) + '...' // Truncate for response
        })),
        attributes: product.attributes,
        createdAt: product.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Get all products with pagination
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featuredType
    } = req.query;

    const query = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by featuredType
    if (featuredType && featuredType !== 'all') {
      query.featuredType = featuredType;
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Product.countDocuments(query);

    // Get product statistics
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          lowStockCount: {
            $sum: {
              $cond: [{ $lt: ['$quantity', 5] }, 1, 0]
            }
          },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      stats: stats[0] || {
        totalProducts: 0,
        totalQuantity: 0,
        lowStockCount: 0,
        averagePrice: 0
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ 
      _id: id, 
      isActive: true 
    }).select('-__v');

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Parse attributes if provided
    if (updateData.attributes) {
      try {
        updateData.attributes = typeof updateData.attributes === 'string' 
          ? JSON.parse(updateData.attributes) 
          : updateData.attributes;
      } catch (error) {
        return res.status(400).json({
          message: 'Invalid attributes format'
        });
      }
    }

    // Process new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const base64Data = convertImageToBase64(file.path);
        if (base64Data) {
          // Store as data URL for easier frontend handling
          const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
          newImages.push({
            data: dataUrl,
            contentType: file.mimetype,
            filename: file.originalname
          });
          console.log(`New image converted: ${file.originalname}, size: ${base64Data.length} chars`);
        } else {
          console.error(`Failed to convert new image: ${file.originalname}`);
        }
      }

      // Get existing product to check current image count
      const existingProduct = await Product.findById(id);
      if (existingProduct) {
        const totalImages = existingProduct.images.length + newImages.length;
        if (totalImages > 5) {
          return res.status(400).json({
            message: 'Total images cannot exceed 5'
          });
        }
        updateData.images = [...existingProduct.images, ...newImages];
      }
    }

    // Convert numeric fields
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.quantity) {
      updateData.quantity = parseInt(updateData.quantity);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // Clean up temporary files
    cleanupTempFiles(req.files);

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // Images are stored in MongoDB, no need to delete from external service
    console.log(`Product has ${product.images ? product.images.length : 0} images stored in MongoDB`);

    // Soft delete by setting isActive to false
    await Product.findByIdAndUpdate(id, { isActive: false });

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Remove specific image from product
export const removeProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { filename } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // Remove image from product (stored in MongoDB)
    product.images = product.images.filter(img => img.filename !== filename);
    await product.save();

    res.json({
      message: 'Image removed successfully',
      product
    });
  } catch (error) {
    console.error('Error removing image:', error);
    res.status(500).json({
      message: 'Failed to remove image',
      error: error.message
    });
  }
};

