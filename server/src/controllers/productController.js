import Product from '../models/Product.js';
import { convertImageToBase64, cleanupTempFiles } from '../middleware/upload.js';
import { uploadToCloudinary, isCloudinaryConfigured, deleteFromCloudinary } from '../config/cloudinary.js';
import axios from 'axios';

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
      featuredType,
      productType,
      customizationOptions,
      warrantyIncluded,
      warrantyMonths
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

    // Parse customizationOptions if it's a string
    let parsedCustomizationOptions = {};
    if (customizationOptions) {
      try {
        parsedCustomizationOptions = typeof customizationOptions === 'string'
          ? JSON.parse(customizationOptions)
          : customizationOptions;
      } catch (error) {
        return res.status(400).json({
          message: 'Invalid customizationOptions format'
        });
      }
    }

    // Parse imageColors if provided
    let parsedImageColors = [];
    if (req.body.imageColors) {
      try {
        parsedImageColors = typeof req.body.imageColors === 'string'
          ? JSON.parse(req.body.imageColors)
          : req.body.imageColors;
      } catch (error) {
        parsedImageColors = Array.isArray(req.body.imageColors) ? req.body.imageColors : [req.body.imageColors];
      }
    }

    // Process uploaded images: Cloudinary if configured, else base64 in MongoDB
    const images = [];
    let pineconeImages = []; // for ML embedding (needs data; we build from files when using Cloudinary)
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} uploaded images (Cloudinary: ${isCloudinaryConfigured()})`);
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageColor = parsedImageColors[i] || 'base';
        console.log('File details:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          filename: file.filename,
          color: imageColor
        });

        if (isCloudinaryConfigured()) {
          const cloudResult = await uploadToCloudinary(file.path);
          if (cloudResult) {
            images.push({
              url: cloudResult.url,
              publicId: cloudResult.publicId,
              contentType: file.mimetype,
              filename: file.originalname,
              color: imageColor
            });
            console.log(`Image uploaded to Cloudinary: ${file.originalname} -> ${cloudResult.url}`);
            // ML/Pinecone still needs image data; provide base64 from file for embedding
            const base64Data = convertImageToBase64(file.path);
            if (base64Data) {
              pineconeImages.push({
                data: `data:${file.mimetype};base64,${base64Data}`,
                contentType: file.mimetype,
                filename: file.originalname
              });
            }
          } else {
            console.error(`Failed to upload image to Cloudinary: ${file.originalname}`);
          }
        } else {
          const base64Data = convertImageToBase64(file.path);
          if (base64Data) {
            const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
            images.push({
              data: dataUrl,
              contentType: file.mimetype,
              filename: file.originalname,
              color: imageColor
            });
            pineconeImages.push({ data: dataUrl, contentType: file.mimetype, filename: file.originalname });
            console.log(`Image converted (fallback): ${file.originalname}, size: ${base64Data.length} chars`);
          } else {
            console.error(`Failed to convert image: ${file.originalname}`);
          }
        }
      }
    }

    // Validate image count
    if (images.length > 50) {
      return res.status(400).json({
        message: 'Maximum 50 images total allowed per product'
      });
    }

    // Set cover image: coverIndex (0-based) from body, default 0 (first image)
    const coverIndex = Math.max(0, parseInt(req.body.coverIndex, 10) || 0);
    if (images.length > 0) {
      const safeCoverIndex = Math.min(coverIndex, images.length - 1);
      images.forEach((img, i) => { img.isCover = (i === safeCoverIndex); });
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
      featuredType: featuredType || 'none',
      productType: productType || 'ready-stock',
      customizationOptions: parsedCustomizationOptions,
      warrantyIncluded: warrantyIncluded === true || warrantyIncluded === 'true',
      warrantyMonths: warrantyIncluded === true || warrantyIncluded === 'true' ? Math.max(0, parseInt(warrantyMonths, 10) || 0) : 0
    });

    console.log('Saving product to database...');
    await product.save();
    console.log('Product saved successfully with ID:', product._id);

    // Add product images to Pinecone for image search (async, non-blocking)
    const imagesForPinecone = pineconeImages.length > 0 ? pineconeImages : (product.images || []).filter(img => img.data).map(img => ({ data: img.data, filename: img.filename, contentType: img.contentType }));
    if (product.category === 'furniture' && imagesForPinecone.length > 0) {
      const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
      axios.post(`${FASTAPI_URL}/add-product`, {
        product_id: product._id.toString(),
        product_name: product.name,
        category: product.category,
        subcategory: product.subcategory || '',
        images: imagesForPinecone
      }, {
        timeout: 10000
      }).then(response => {
        console.log(`✅ Product ${product._id} added to image search:`, response.data.message);
      }).catch(error => {
        console.warn(`⚠️ Could not add product ${product._id} to image search:`, error.message);
      });
    }

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
          url: img.url || (img.data ? img.data.substring(0, 50) + '...' : null)
        })),
        attributes: product.attributes,
        productType: product.productType,
        customizationOptions: product.customizationOptions,
        warrantyIncluded: product.warrantyIncluded,
        warrantyMonths: product.warrantyMonths,
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
      featuredType,
      productType
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

    // Filter by productType
    if (productType && productType !== 'all') {
      query.productType = productType;
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
      .select('-__v')
      .lean();

    const total = await Product.countDocuments(query);
    const baseUrl = req.baseUrl || `${req.protocol}://${req.get('host')}`;

    const productsWithUrls = products.map((p) => ({
      ...p,
      imageUrls: (p.images && p.images.length)
        ? p.images.map((img, i) => img.url || `${baseUrl}/api/images/${p._id}/${i}`)
        : [],
    }));

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
      products: productsWithUrls,
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
    }).select('-__v').lean();

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    const baseUrl = req.baseUrl || `${req.protocol}://${req.get('host')}`;
    const productWithUrls = {
      ...product,
      imageUrls: (product.images && product.images.length)
        ? product.images.map((img, i) => img.url || `${baseUrl}/api/images/${product._id}/${i}`)
        : [],
    };

    res.json({ product: productWithUrls });
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
    const updateData = { ...req.body };

    // Prevent accidental overwriting of images arrays from text field payloads
    delete updateData.images;
    delete updateData.imageColors;

    console.log('Update product request:', {
      productId: id,
      hasFiles: !!req.files,
      filesCount: req.files ? req.files.length : 0
    });

    // Parse attributes if provided
    if (updateData.attributes) {
      try {
        updateData.attributes = typeof updateData.attributes === 'string'
          ? JSON.parse(updateData.attributes)
          : updateData.attributes;
      } catch (error) {
        console.error('Error parsing attributes:', error);
        return res.status(400).json({
          message: 'Invalid attributes format'
        });
      }
    }

    // Parse customizationOptions if provided
    if (updateData.customizationOptions) {
      try {
        updateData.customizationOptions = typeof updateData.customizationOptions === 'string'
          ? JSON.parse(updateData.customizationOptions)
          : updateData.customizationOptions;
      } catch (error) {
        console.error('Error parsing customizationOptions:', error);
        return res.status(400).json({
          message: 'Invalid customizationOptions format'
        });
      }
    }

    // Convert numeric fields
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.quantity) {
      updateData.quantity = parseInt(updateData.quantity);
    }
    if (updateData.hasOwnProperty('warrantyIncluded')) {
      updateData.warrantyIncluded = updateData.warrantyIncluded === true || updateData.warrantyIncluded === 'true';
    }
    if (updateData.hasOwnProperty('warrantyMonths')) {
      const months = parseInt(updateData.warrantyMonths, 10);
      updateData.warrantyMonths = isNaN(months) ? 0 : Math.max(0, months);
      if (!updateData.warrantyIncluded) updateData.warrantyMonths = 0;
    }

    // Parse imageColors if provided
    let parsedImageColors = [];
    if (req.body.imageColors) {
      try {
        parsedImageColors = typeof req.body.imageColors === 'string'
          ? JSON.parse(req.body.imageColors)
          : req.body.imageColors;
      } catch (error) {
        parsedImageColors = Array.isArray(req.body.imageColors) ? req.body.imageColors : [req.body.imageColors];
      }
    }

    // Process uploaded images if any: Cloudinary if configured, else base64
    let pineconeImagesForUpdate = [];
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} uploaded images for update (Cloudinary: ${isCloudinaryConfigured()})`);
      const images = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageColor = parsedImageColors[i] || 'base';
        console.log('File details:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          filename: file.filename,
          color: imageColor
        });

        if (isCloudinaryConfigured()) {
          const cloudResult = await uploadToCloudinary(file.path);
          if (cloudResult) {
            images.push({
              url: cloudResult.url,
              publicId: cloudResult.publicId,
              contentType: file.mimetype,
              filename: file.originalname,
              color: imageColor
            });
            console.log(`Image uploaded to Cloudinary: ${file.originalname} -> ${cloudResult.url}`);
            const base64Data = convertImageToBase64(file.path);
            if (base64Data) {
              pineconeImagesForUpdate.push({
                data: `data:${file.mimetype};base64,${base64Data}`,
                contentType: file.mimetype,
                filename: file.originalname
              });
            }
          } else {
            console.error(`Failed to upload image to Cloudinary: ${file.originalname}`);
          }
        } else {
          const base64Data = convertImageToBase64(file.path);
          if (base64Data) {
            const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
            images.push({
              data: dataUrl,
              contentType: file.mimetype,
              filename: file.originalname,
              color: imageColor
            });
            pineconeImagesForUpdate.push({ data: dataUrl, contentType: file.mimetype, filename: file.originalname });
            console.log(`Image converted: ${file.originalname}, size: ${base64Data.length} chars`);
          } else {
            console.error(`Failed to convert image: ${file.originalname}`);
          }
        }
      }

      if (images.length > 0) {
        const coverIndex = Math.max(0, parseInt(req.body.coverIndex, 10) || 0);
        const safeCoverIndex = Math.min(coverIndex, images.length - 1);
        images.forEach((img, i) => { img.isCover = (i === safeCoverIndex); });
        updateData.images = images;
        console.log(`Added ${images.length} images to update data (cover index: ${safeCoverIndex})`);
      }

      cleanupTempFiles(req.files);
    } else if (req.body.coverIndex !== undefined && req.body.coverIndex !== '') {
      // No new files but cover index changed: update only isCover on existing images
      const doc = await Product.findById(id);
      if (doc && doc.images && doc.images.length > 0) {
        const coverIndex = Math.max(0, parseInt(req.body.coverIndex, 10) || 0);
        const safeCoverIndex = Math.min(coverIndex, doc.images.length - 1);
        doc.images.forEach((img, i) => { img.isCover = (i === safeCoverIndex); });
        doc.markModified('images');
        await doc.save();
      }
    }

    console.log('About to update product with data:', {
      name: updateData.name,
      category: updateData.category,
      price: updateData.price,
      quantity: updateData.quantity
    });

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

    console.log('Product updated successfully:', product.name);

    const imagesForPineconeUpdate = pineconeImagesForUpdate.length > 0
      ? pineconeImagesForUpdate
      : (product.images || []).filter(img => img.data).map(img => ({ data: img.data, filename: img.filename, contentType: img.contentType }));
    if (product.category === 'furniture' && imagesForPineconeUpdate.length > 0) {
      const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
      axios.post(`${FASTAPI_URL}/add-product`, {
        product_id: product._id.toString(),
        product_name: product.name,
        category: product.category,
        subcategory: product.subcategory || '',
        images: imagesForPineconeUpdate
      }, { timeout: 10000 }).then(response => {
        console.log(`Product ${product._id} updated in image search:`, response.data.message);
      }).catch(error => {
        console.warn(`Could not update product ${product._id} in image search:`, error.message);
      });
    }

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

    for (const img of product.images || []) {
      if (img.publicId) await deleteFromCloudinary(img.publicId);
    }
    console.log(`Product has ${product.images ? product.images.length : 0} images (Cloudinary assets cleaned)`);

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

    const toRemove = product.images.find(img => img.filename === filename);
    if (toRemove?.publicId) await deleteFromCloudinary(toRemove.publicId);
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

/**
 * Reindex all furniture products into the image search (Pinecone) service.
 * For each product: uses stored base64 when available, otherwise fetches image from URL
 * (Cloudinary or /api/images) and sends to FastAPI add-product.
 * Call this once to fix "same image from site not showing" when products were never indexed.
 */
export const reindexImageSearch = async (req, res) => {
  const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  try {
    const products = await Product.find({
      category: 'furniture',
      isActive: true
    }).select('name category subcategory images').lean();

    let reindexed = 0;
    const errors = [];

    for (const product of products) {
      const images = product.images || [];
      if (images.length === 0) continue;

      const imagesForPinecone = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.data) {
          const data = img.data.includes(',') ? img.data : `data:${img.contentType || 'image/jpeg'};base64,${img.data}`;
          imagesForPinecone.push({
            data: data,
            filename: img.filename || `product_${product._id}_${i}.jpg`,
            contentType: img.contentType || 'image/jpeg'
          });
          continue;
        }
        const imageUrl = img.url || `${baseUrl}/api/images/${product._id}/${i}`;
        try {
          const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 15000,
            maxRedirects: 5
          });
          const contentType = response.headers['content-type'] || img.contentType || 'image/jpeg';
          const base64 = Buffer.from(response.data).toString('base64');
          imagesForPinecone.push({
            data: `data:${contentType};base64,${base64}`,
            filename: img.filename || `product_${product._id}_${i}.jpg`,
            contentType: contentType
          });
        } catch (fetchErr) {
          errors.push({ productId: product._id, imageIndex: i, error: fetchErr.message });
          continue;
        }
      }

      if (imagesForPinecone.length === 0) continue;

      try {
        await axios.post(`${FASTAPI_URL}/add-product`, {
          product_id: product._id.toString(),
          product_name: product.name,
          category: product.category,
          subcategory: product.subcategory || '',
          images: imagesForPinecone
        }, { timeout: 30000 });
        reindexed++;
        console.log(`Reindexed image search for product: ${product.name} (${product._id})`);
      } catch (apiErr) {
        errors.push({ productId: product._id, productName: product.name, error: apiErr.message });
      }
    }

    res.json({
      message: `Reindexed ${reindexed} furniture products for image search`,
      reindexed,
      total: products.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Reindex image search failed:', error);
    res.status(500).json({
      message: 'Reindex failed',
      error: error.message
    });
  }
};

