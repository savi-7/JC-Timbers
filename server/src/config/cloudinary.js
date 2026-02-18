import { v2 as cloudinary } from 'cloudinary';

// Read env vars dynamically (not at module load time)
const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
    return { cloudName, apiKey, apiSecret };
  }
  return null;
};

// Initialize on first use
let configInitialized = false;
const initConfig = () => {
  if (!configInitialized) {
    const config = getCloudinaryConfig();
    configInitialized = true;
    return config !== null;
  }
  return getCloudinaryConfig() !== null;
};

export const isCloudinaryConfigured = () => {
  initConfig();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return !!(cloudName && apiKey && apiSecret);
};

/**
 * Upload an image file to Cloudinary.
 * @param {string} filePath - Local path to the image file (e.g. from multer)
 * @param {object} options - Optional: folder, use_filename, etc.
 * @returns {Promise<{ url: string, publicId: string }|null>} URL and public_id, or null on failure
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  initConfig(); // Ensure config is initialized
  if (!isCloudinaryConfigured()) {
    console.warn('Cloudinary not configured (missing env). Skipping upload.');
    return null;
  }
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder || 'jc-timbers/products',
      use_filename: true,
      unique_filename: true,
      ...options
    });
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

/**
 * Delete an image from Cloudinary by public_id.
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<boolean>} true if deleted or Cloudinary not configured
 */
export const deleteFromCloudinary = async (publicId) => {
  initConfig(); // Ensure config is initialized
  if (!isCloudinaryConfigured() || !publicId) return true;
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

export default cloudinary;
