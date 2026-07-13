import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { uploadSingleImage, handleUploadError } from "../middleware/upload.js";
import { listListings, getListingById, createListing, getListingImage } from "../controllers/marketplaceController.js";

const router = express.Router();

// Public: browse listings, get by id, get listing image (full URL: .../api/marketplace/listings/:id/image)
router.get("/listings", listListings);
router.get("/listings/:id/image", getListingImage);
router.get("/listings/:id", getListingById);

// Auth: post new listing (single image)
router.post(
  "/listings",
  authenticateToken,
  uploadSingleImage,
  handleUploadError,
  createListing
);

export default router;
