# Product Manager Module - Setup Instructions

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install cloudinary multer multer-storage-cloudinary
```

### 2. Environment Variables
Create a `.env` file in the `server` directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/timber-website

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5001
CLIENT_ORIGIN=http://localhost:5173

# Cloudinary Configuration (Required for Product Management)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3. Cloudinary Setup
1. Sign up for a free Cloudinary account at https://cloudinary.com
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add these values to your `.env` file

### 4. Run Seed Data
```bash
cd server
node scripts/seedProducts.js
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd client
npm install swiper
```

### 2. Start Development Servers
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

## API Endpoints

### Public Routes
- `GET /api/products` - Get all products (paginated)
- `GET /api/products/:id` - Get single product

### Admin Routes (Require JWT)
- `POST /api/products` - Create product with images
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Features

### Backend Features
- ✅ Multi-image upload (max 5 images per product)
- ✅ Category-specific attributes (timber, furniture, construction)
- ✅ Cloudinary integration for image hosting
- ✅ JWT authentication and admin authorization
- ✅ Image validation and error handling
- ✅ Soft delete for products

### Frontend Features
- ✅ Admin product management page
- ✅ Dynamic form with category-specific fields
- ✅ Image upload with preview
- ✅ Product table with thumbnails
- ✅ Low stock warnings
- ✅ Responsive design with Tailwind CSS

## Sample Data

The seed script creates 3 sample products:

1. **Teak Plank** (Timber)
   - 3 images
   - Attributes: woodType, dimension, grade

2. **Dining Table** (Furniture)
   - 4 images
   - Attributes: furnitureType, material, polish, style

3. **Wooden Door** (Construction)
   - 2 images
   - Attributes: productType, size, finish, usage

## Usage

1. Login as admin
2. Navigate to Admin Dashboard
3. Click "Product Management"
4. Add/Edit/Delete products with images and attributes
5. View products with image carousels

## File Structure

```
server/
├── src/
│   ├── models/Product.js
│   ├── controllers/productController.js
│   ├── routes/productRoutes.js
│   ├── middleware/upload.js
│   ├── config/cloudinary.js
│   └── middleware/auth.js
├── scripts/seedProducts.js
└── .env

client/
├── src/
│   ├── pages/AdminProducts.jsx
│   ├── components/ProductForm.jsx
│   └── api/axios.js
```










