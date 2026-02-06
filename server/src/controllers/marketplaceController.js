import MarketplaceListing from "../models/MarketplaceListing.js";
import { convertImageToBase64, cleanupTempFiles } from "../middleware/upload.js";

// Serve listing image as binary (full URL: http://host:port/api/marketplace/listings/:id/image)
export const getListingImage = async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id).select("image").lean();
    if (!listing || !listing.image || !listing.image.data) {
      return res.status(404).json({ message: "Image not found" });
    }
    const image = listing.image;
    let base64Data = image.data;
    if (base64Data.startsWith("data:")) {
      base64Data = base64Data.split(",")[1];
    }
    res.set({
      "Content-Type": image.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=31536000",
    });
    res.send(Buffer.from(base64Data, "base64"));
  } catch (err) {
    console.error("Marketplace getListingImage error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Browse listings (public) - only active/approved, with optional filters
export const listListings = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, condition, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const query = { status: { $in: ["active", "approved"] } };
    if (category) query.category = category;
    if (condition) query.condition = condition;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const listings = await MarketplaceListing.find(query)
      .populate("user", "name email")
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select("-__v")
      .lean();

    const total = await MarketplaceListing.countDocuments(query);
    const baseUrl = req.baseUrl || `${req.protocol}://${req.get("host")}`;

    const listingsWithUrls = listings.map((l) => ({
      ...l,
      imageUrl: l.image ? `${baseUrl}/api/marketplace/listings/${l._id}/image` : null,
    }));

    res.json({
      listings: listingsWithUrls,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (err) {
    console.error("Marketplace listListings error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get single listing by ID (public)
export const getListingById = async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id)
      .populate("user", "name email")
      .select("-__v")
      .lean();

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (!["active", "approved"].includes(listing.status)) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const baseUrl = req.baseUrl || `${req.protocol}://${req.get("host")}`;
    const listingWithUrl = {
      ...listing,
      imageUrl: listing.image ? `${baseUrl}/api/marketplace/listings/${listing._id}/image` : null,
    };

    res.json({ listing: listingWithUrl });
  } catch (err) {
    console.error("Marketplace getListingById error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Create listing (auth required)
export const createListing = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { title, price, category, condition, description, location, lat, lon } = req.body;

    if (!title || !price || !category || !condition || !description || !location || lat === undefined || lon === undefined) {
      return res.status(400).json({
        message: "Title, price, category, condition, description, location, lat, and lon are required",
      });
    }

    const validConditions = ["new", "used-like-new", "used-good", "fair"];
    if (!validConditions.includes(condition)) {
      return res.status(400).json({ message: "Invalid condition. Must be: new, used-like-new, used-good, fair" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "One image is required" });
    }

    const base64Data = convertImageToBase64(req.file.path);
    if (!base64Data) {
      return res.status(400).json({ message: "Failed to process image" });
    }

    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    const listing = new MarketplaceListing({
      user: userId,
      title: title.trim(),
      price: parseFloat(price),
      category: (category || "").trim(),
      condition,
      description: description.trim(),
      location: location.trim(),
      locationCoords: { lat: parseFloat(lat), lon: parseFloat(lon) },
      image: {
        data: dataUrl,
        contentType: req.file.mimetype,
        filename: req.file.originalname,
      },
      status: "pending",
      paymentStatus: "pending",
    });

    await listing.save();
    cleanupTempFiles([req.file]);

    res.status(201).json({
      message: "Listing created successfully. It will be visible after approval.",
      listing: {
        id: listing._id,
        title: listing.title,
        price: listing.price,
        category: listing.category,
        condition: listing.condition,
        status: listing.status,
        createdAt: listing.createdAt,
      },
    });
  } catch (err) {
    console.error("Marketplace createListing error:", err);
    if (req.file) cleanupTempFiles([req.file]);
    res.status(500).json({ message: err.message });
  }
};
