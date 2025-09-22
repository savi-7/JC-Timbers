import Product from '../models/Product.js';

// API endpoint to serve images from MongoDB
export const getProductImage = async (req, res) => {
  try {
    const { productId, imageIndex } = req.params;
    
    console.log(`Serving image for product ${productId}, index ${imageIndex}`);
    
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const imageIndexNum = parseInt(imageIndex);
    if (imageIndexNum < 0 || imageIndexNum >= product.images.length) {
      console.log(`Image index ${imageIndexNum} out of range. Product has ${product.images.length} images`);
      return res.status(404).json({ message: 'Image not found' });
    }
    
    const image = product.images[imageIndexNum];
    console.log(`Serving image: ${image.filename}, type: ${image.contentType}`);
    
    // Extract base64 data from data URL if needed
    let base64Data = image.data;
    if (image.data.startsWith('data:')) {
      // Extract base64 part from data URL (format: data:image/jpeg;base64,{base64_string})
      base64Data = image.data.split(',')[1];
    }
    
    // Set appropriate headers
    res.set({
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'Content-Length': Buffer.byteLength(base64Data, 'base64')
    });
    
    // Send the base64 image data
    res.send(Buffer.from(base64Data, 'base64'));
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: 'Failed to serve image' });
  }
};
