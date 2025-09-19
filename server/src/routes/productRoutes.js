import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';
import { uploadImages, handleUploadError } from '../middleware/upload.js';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  removeProductImage
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes (require JWT authentication and admin role)
router.use(authenticateToken);
router.use(authorizeAdmin);

// Product CRUD routes with image upload
router.post('/', uploadImages, handleUploadError, createProduct);
router.put('/:id', uploadImages, handleUploadError, updateProduct);
router.delete('/:id', deleteProduct);
router.delete('/:id/images', removeProductImage);

export default router;



