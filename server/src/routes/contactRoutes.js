import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';
import {
  submitContact,
  getAdminContacts,
  getContactById,
  updateContact,
  replyToContact,
  deleteContact,
  getContactStats
} from '../controllers/contactController.js';

const router = express.Router();

// Public routes
router.post('/', submitContact); // Allow both authenticated and guest users

// Admin routes
router.get('/admin', authenticateToken, authorizeAdmin, getAdminContacts);
router.get('/admin/stats', authenticateToken, authorizeAdmin, getContactStats);
router.get('/admin/:id', authenticateToken, authorizeAdmin, getContactById);
router.put('/admin/:id', authenticateToken, authorizeAdmin, updateContact);
router.post('/admin/:id/reply', authenticateToken, authorizeAdmin, replyToContact);
router.delete('/admin/:id', authenticateToken, authorizeAdmin, deleteContact);

export default router;



