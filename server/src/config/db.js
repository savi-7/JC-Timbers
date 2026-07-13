import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Reuse existing connection (important for Vercel serverless)
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    const opts = {
      serverSelectionTimeoutMS: 15000, // Allow more time for cold starts
      connectTimeoutMS: 15000,
    };
    await mongoose.connect(process.env.MONGODB_URI, opts);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    // Don't exit in serverless (Vercel) - let the function handle retries
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
