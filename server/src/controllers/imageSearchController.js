import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

/**
 * Search for similar furniture images using AI
 * Calls the FastAPI service for CLIP embedding and Pinecone search
 */
export const searchByImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { top_k = 5 } = req.body;
    const topK = parseInt(top_k) || 5;

    // Validate top_k
    if (topK < 1 || topK > 20) {
      return res.status(400).json({
        success: false,
        message: 'top_k must be between 1 and 20'
      });
    }

    // Create form data for FastAPI
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    formData.append('top_k', topK.toString());

    // Call FastAPI service
    const response = await axios.post(
      `${FASTAPI_URL}/search-by-image`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.error('Error deleting temp file:', error);
    }

    // Return results
    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error deleting temp file:', cleanupError);
      }
    }

    console.error('Error in searchByImage:', error);

    // Handle specific error cases
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Image search service is unavailable. Please ensure the FastAPI service is running.',
        error: 'Service unavailable'
      });
    }

    if (error.response) {
      // FastAPI returned an error
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data?.detail || 'Error processing image search',
        error: error.response.data
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during image search',
      error: error.message
    });
  }
};

/**
 * Search for similar furniture images using base64 encoded image
 * Calls the FastAPI service for CLIP embedding and Pinecone search
 */
export const searchByImageBase64 = async (req, res) => {
  try {
    const { image_base64, top_k = 5 } = req.body;

    if (!image_base64) {
      return res.status(400).json({
        success: false,
        message: 'No image_base64 provided'
      });
    }

    const topK = parseInt(top_k) || 5;

    // Validate top_k
    if (topK < 1 || topK > 20) {
      return res.status(400).json({
        success: false,
        message: 'top_k must be between 1 and 20'
      });
    }

    // Call FastAPI service
    const formData = new FormData();
    formData.append('image_base64', image_base64);
    formData.append('top_k', topK.toString());

    const response = await axios.post(
      `${FASTAPI_URL}/search-by-image-base64`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Return results
    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error in searchByImageBase64:', error);

    // Handle specific error cases
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Image search service is unavailable. Please ensure the FastAPI service is running.',
        error: 'Service unavailable'
      });
    }

    if (error.response) {
      // FastAPI returned an error
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data?.detail || 'Error processing image search',
        error: error.response.data
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during image search',
      error: error.message
    });
  }
};

/**
 * Health check for image search service
 */
export const checkImageSearchHealth = async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/health`, {
      timeout: 5000
    });

    return res.status(200).json({
      success: true,
      service: 'Image Search API',
      status: response.data
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      service: 'Image Search API',
      status: 'unavailable',
      message: 'FastAPI service is not running or not accessible',
      error: error.message
    });
  }
};

