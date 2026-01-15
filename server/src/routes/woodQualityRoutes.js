import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { addSample, listSamples, trainFromMongo } from "../controllers/woodQualityController.js";

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.post('/wood-quality/samples', addSample);
router.get('/wood-quality/samples', listSamples);
router.post('/wood-quality/train', trainFromMongo);

export default router;
