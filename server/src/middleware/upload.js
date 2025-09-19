import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Increased limit to handle edge cases
    fieldSize: 10 * 1024 * 1024, // 10MB for form fields
    fieldNameSize: 100, // Max field name length
    fieldValueSize: 10 * 1024 * 1024 // Max field value size
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware for handling multiple image uploads
export const uploadImages = upload.array('images', 5);

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  console.error('Upload error:', error);
  
  if (error instanceof multer.MulterError) {
    console.error('Multer error code:', error.code);
    console.error('Multer error message:', error.message);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size too large. Maximum 5MB per image.',
        error: error.message
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum 5 images allowed.',
        error: error.message
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected field name. Use "images" for file uploads.',
        error: error.message
      });
    }
    if (error.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({
        message: 'Too many parts in the multipart request.',
        error: error.message
      });
    }
    if (error.code === 'LIMIT_FIELD_KEY') {
      return res.status(400).json({
        message: 'Field name too long.',
        error: error.message
      });
    }
    if (error.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({
        message: 'Field value too long.',
        error: error.message
      });
    }
    if (error.code === 'LIMIT_FIELD_COUNT') {
      return res.status(400).json({
        message: 'Too many fields.',
        error: error.message
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      message: 'Only image files are allowed',
      error: error.message
    });
  }
  
  // Log any other errors
  console.error('Unknown upload error:', error);
  next(error);
};

// Helper function to convert image to base64
export const convertImageToBase64 = (filePath) => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64String = imageBuffer.toString('base64');
    console.log(`Converting image: ${filePath}, size: ${imageBuffer.length} bytes`);
    return base64String;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

// Helper function to clean up temporary files
export const cleanupTempFiles = (files) => {
  if (files && files.length > 0) {
    files.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log('Cleaned up temporary file:', file.path);
        }
      } catch (error) {
        console.error('Error cleaning up file:', file.path, error);
      }
    });
  }
};

export default upload;