import express from 'express';
import {
    submitEnquiry,
    getMyEnquiries,
    getAllEnquiries,
    updateEnquiryQuote,
    acceptQuote
} from '../controllers/enquiryController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// User Routes
router.post('/enquiries', authenticateToken, upload.array('images', 5), submitEnquiry);
router.get('/enquiries/my', authenticateToken, getMyEnquiries);
router.put('/enquiries/:id/accept', authenticateToken, acceptQuote);

// Admin Routes
router.get('/admin/enquiries', authenticateToken, requireAdmin, getAllEnquiries);
router.put('/admin/enquiries/:id', authenticateToken, requireAdmin, updateEnquiryQuote);

export default router;
