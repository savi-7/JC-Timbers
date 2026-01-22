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
    console.log('=== Image Search Request ===');
    console.log('Request received:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        fieldname: req.file.fieldname
      } : null,
      body: req.body,
      query: req.query
    });
    
    // Early validation
    if (!req.file) {
      console.error('ERROR: No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please upload an image file.'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      console.error('No file uploaded in request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please upload an image file.'
      });
    }

    // Validate file
    if (!req.file.mimetype.startsWith('image/')) {
      console.error('Invalid file type:', req.file.mimetype);
      // Clean up invalid file
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error deleting invalid file:', cleanupError);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only image files are allowed.'
      });
    }

    const top_k = req.body?.top_k || req.query?.top_k || 5;
    const topK = parseInt(top_k) || 5;

    // Validate top_k
    if (topK < 1 || topK > 20) {
      return res.status(400).json({
        success: false,
        message: 'top_k must be between 1 and 20'
      });
    }

    // Verify file exists and is readable
    if (!fs.existsSync(req.file.path)) {
      console.error('Uploaded file does not exist:', req.file.path);
      return res.status(500).json({
        success: false,
        message: 'Uploaded file not found on server',
        error: 'File not found'
      });
    }

    const fileStats = fs.statSync(req.file.path);
    if (fileStats.size === 0) {
      console.error('Uploaded file is empty:', req.file.path);
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Uploaded file is empty',
        error: 'Empty file'
      });
    }

    console.log('Preparing to call FastAPI service:', {
      fastapiUrl: FASTAPI_URL,
      endpoint: `${FASTAPI_URL}/search-by-image`,
      topK: topK,
      filePath: req.file.path,
      fileSize: fileStats.size,
      fileName: req.file.originalname
    });

    // Create form data for FastAPI
    const formData = new FormData();
    
    try {
      // Read file as buffer - more reliable than stream for FastAPI
      const fileBuffer = fs.readFileSync(req.file.path);
      
      console.log('File read successfully:', {
        size: fileBuffer.length,
        expectedSize: fileStats.size,
        match: fileBuffer.length === fileStats.size
      });
      
      // Append file buffer to form data
      formData.append('file', fileBuffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
      formData.append('top_k', topK.toString());

      console.log('Calling FastAPI service...');
      
      // Call FastAPI service
      const response = await axios.post(
        `${FASTAPI_URL}/search-by-image`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          },
          timeout: 60000, // 60 second timeout for image processing
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      console.log('FastAPI response received:', {
        status: response.status,
        hasData: !!response.data,
        resultsCount: response.data?.results?.length || 0
      });

      // Clean up uploaded file
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up temp file:', req.file.path);
      } catch (error) {
        console.error('Error deleting temp file:', error);
      }

      // Return results
      return res.status(200).json({
        success: true,
        data: response.data
      });
    } catch (formDataError) {
      console.error('Error creating form data or reading file:', formDataError);
      // Clean up uploaded file
      try {
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error('Error deleting temp file:', cleanupError);
      }
      throw formDataError; // Re-throw to be caught by outer catch
    }

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up temp file after error:', req.file.path);
      } catch (cleanupError) {
        console.error('Error deleting temp file:', cleanupError);
      }
    }

    console.error('Error in searchByImage:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      stack: error.stack
    });

    // Handle specific error cases
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
      console.error('FastAPI service connection refused. Is it running on', FASTAPI_URL, '?');
      return res.status(503).json({
        success: false,
        message: 'Image search service is unavailable. Please ensure the FastAPI service is running on port 8000.',
        error: 'Service unavailable',
        details: `Could not connect to ${FASTAPI_URL}. Please start the FastAPI service.`
      });
    }

    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      console.error('FastAPI service request timed out');
      return res.status(504).json({
        success: false,
        message: 'Image search request timed out. The service may be overloaded or the image is too large.',
        error: 'Request timeout'
      });
    }

    if (error.response) {
      // FastAPI returned an error
      console.error('FastAPI returned error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data?.detail || error.response.data?.message || 'Error processing image search',
        error: error.response.data,
        status: error.response.status
      });
    }

    // Network or other errors
    console.error('Unexpected error during image search:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });
    
    // Provide more detailed error message
    let errorMessage = 'Internal server error during image search';
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message || 'Unknown error occurred',
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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


