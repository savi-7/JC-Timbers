import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import segmentationRoutes from "./routes/segmentationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";
import woodQualityRoutes from "./routes/woodQualityRoutes.js";
import serviceScheduleRoutes from "./routes/serviceScheduleRoutes.js";
import serviceEnquiryRoutes from "./routes/serviceEnquiryRoutes.js";
import holidayRoutes from "./routes/holidayRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import { getAvailableSlots } from "./controllers/serviceScheduleController.js";
import { getProductImage } from "./controllers/imageController.js";
import { getBaseUrl } from "./utils/getBaseUrl.js";

dotenv.config();
connectDB();

const app = express();

// Backend requirements: Return JSON | JWT auth (see routes/middleware) | Full image URLs (see getBaseUrl, product/marketplace responses)

// Middleware: attach base URL for full image URLs (e.g. http://192.168.1.5:5000)
app.use((req, res, next) => {
  req.baseUrl = getBaseUrl(req);
  next();
});

// Middleware - CORS
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = new Set([
  CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);
// Allow Flutter web dev server (random port, e.g. localhost:53340)
const isLocalhostOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || isLocalhostOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));
// Parse JSON bodies - but don't parse multipart/form-data (multer handles that)
app.use(express.json({ limit: '10mb' }));

// Serve static files from uploads directory (fallback for local uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/products", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", wishlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/segmentation", segmentationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", mlRoutes);

// PUBLIC route for availability check - register BEFORE any protected routes
app.get("/api/services/schedule/available/:date", getAvailableSlots);

// Register service routes AFTER the public route
app.use("/api/services", serviceScheduleRoutes);
app.use("/api/services", serviceEnquiryRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/marketplace", marketplaceRoutes);
// Register woodQualityRoutes LAST - it uses router.use(requireAdmin) which applies to ALL routes in that router
app.use("/api", woodQualityRoutes);

// Image serving route
app.get("/api/images/:productId/:imageIndex", getProductImage);

// API responses are JSON (res.json). Protected routes use JWT via middleware/auth.js (Authorization: Bearer <token>).

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Server Start
const PORT = Number(process.env.PORT) || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
