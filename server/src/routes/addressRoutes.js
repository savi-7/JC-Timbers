import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/addressController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all addresses for the authenticated user
router.get('/', getUserAddresses);

// Add new address
router.post('/', addAddress);

// Update address
router.put('/:id', updateAddress);

// Delete address
router.delete('/:id', deleteAddress);

// Set default address
router.patch('/:id/default', setDefaultAddress);

export default router;
