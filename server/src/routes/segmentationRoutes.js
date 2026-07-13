import express from 'express';
import { snapshotSegments } from '../controllers/segmentationController.js';

const router = express.Router();

// GET /api/segmentation/snapshot
router.get('/snapshot', snapshotSegments);

export default router;





