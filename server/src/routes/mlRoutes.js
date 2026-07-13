import express from "express";
import { predictWoodQuality } from "../controllers/mlController.js";
import { 
  searchByImage, 
  searchByImageBase64, 
  checkImageSearchHealth 
} from "../controllers/imageSearchController.js";
import { uploadSingleImage, handleUploadError } from "../middleware/upload.js";

const router = express.Router();

// Wood quality prediction
router.post("/ml/wood-quality/predict", predictWoodQuality);

// Image search endpoints
router.get("/ml/image-search/health", checkImageSearchHealth);
router.post(
  "/ml/image-search/by-image", 
  uploadSingleImage,
  handleUploadError,
  searchByImage
);
router.post("/ml/image-search/by-base64", searchByImageBase64);

export default router;
