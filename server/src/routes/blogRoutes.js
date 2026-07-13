import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';
import { uploadBlogImageMiddleware, handleBlogUploadError } from '../middleware/blogUpload.js';
import {
  getAllBlogs,
  getAdminBlogs,
  getBlogById,
  addBlog,
  updateBlog,
  deleteBlog,
  getBlogCategories
} from '../controllers/blogController.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/categories', getBlogCategories);
router.get('/:id', getBlogById);

// Admin routes
router.get('/admin/all', authenticateToken, authorizeAdmin, getAdminBlogs);
router.post('/admin', authenticateToken, authorizeAdmin, uploadBlogImageMiddleware, handleBlogUploadError, addBlog);
router.put('/admin/:id', authenticateToken, authorizeAdmin, uploadBlogImageMiddleware, handleBlogUploadError, updateBlog);
router.delete('/admin/:id', authenticateToken, authorizeAdmin, deleteBlog);

export default router;
