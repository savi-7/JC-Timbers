import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';
import {
  getAllFAQs,
  getAdminFAQs,
  addFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQCategories
} from '../controllers/faqController.js';

const router = express.Router();

// Public routes
router.get('/', getAllFAQs);
router.get('/categories', getFAQCategories);

// Admin routes
router.get('/admin', authenticateToken, authorizeAdmin, getAdminFAQs);
router.post('/admin', authenticateToken, authorizeAdmin, addFAQ);
router.put('/admin/:id', authenticateToken, authorizeAdmin, updateFAQ);
router.delete('/admin/:id', authenticateToken, authorizeAdmin, deleteFAQ);

export default router;




