# JC-TIMBERS E-COMMERCE PLATFORM
## Complete Project Documentation

---

**Project Name:** JC-Timbers E-Commerce Web Application  
**Version:** 1.0.0  
**Technology:** MERN Stack (MongoDB, Express.js, React, Node.js)  
**Author:** Sunshine  
**Date:** October 2025  

---

## TABLE OF CONTENTS

1. [Abstract](#abstract)
2. [Introduction](#introduction)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [Backend Modules](#backend-modules)
7. [Frontend Modules](#frontend-modules)
8. [API Endpoints](#api-endpoints)
9. [Key Features](#key-features)
10. [Conclusion](#conclusion)

---

## ABSTRACT

JC-Timbers is a comprehensive full-stack e-commerce web application designed specifically for the timber, furniture, and construction materials industry. The platform provides a complete business solution with separate interfaces for administrators and customers. The system enables vendors to manage wood intake, administrators to control inventory and orders, and customers to browse products, manage shopping carts, place orders, and track their purchase history.

The application is built using the MERN stack (MongoDB, Express.js, React, Node.js) and incorporates modern web technologies including Firebase authentication, Razorpay payment gateway integration, role-based access control (RBAC), and responsive UI design with TailwindCSS. The platform features real-time inventory management, order tracking, vendor management, customer support ticketing, and comprehensive analytics dashboards.

**Key Modules:**
- User Authentication & Authorization (JWT + Firebase)
- Product Catalog Management
- Shopping Cart & Wishlist
- Order Management System
- Payment Gateway Integration (Razorpay + COD)
- Vendor & Wood Intake Management
- Inventory/Stock Management
- Admin Dashboard with Analytics
- Customer Support System
- Address Management
- Blog & FAQ Management

---

## 1. INTRODUCTION

### 1.1 Project Overview
JC-Timbers is an enterprise-level e-commerce platform tailored for the timber and furniture industry. It streamlines the entire business workflow from vendor management and wood procurement to product sales and order fulfillment.

### 1.2 Problem Statement
Traditional timber businesses face challenges in:
- Managing multiple vendors and wood intake records
- Tracking inventory across different categories (timber, furniture, construction materials)
- Providing customers with an organized online shopping experience
- Handling complex order fulfillment and payment processing
- Maintaining customer relationships through support systems

### 1.3 Solution
JC-Timbers provides an integrated digital platform that:
- Automates vendor and inventory management
- Offers a modern, user-friendly shopping interface
- Implements secure payment processing with multiple options
- Provides real-time order tracking and management
- Includes comprehensive admin dashboards for business analytics
- Supports customer engagement through blogs, FAQs, and support tickets

### 1.4 Project Scope
The application includes:
- **Admin Panel:** Complete business management dashboard
- **Customer Portal:** Product browsing, shopping, and order management
- **Vendor Management:** Wood intake tracking and vendor relationship management
- **Inventory System:** Stock management with low-stock alerts
- **Payment Processing:** Integrated Razorpay and Cash on Delivery options
- **Customer Support:** Ticket-based support system
- **Content Management:** Blogs and FAQs for customer education

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (React + Vite)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │ Contexts │  │  Hooks   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/HTTPS (Axios)
                          │ REST API Calls
┌─────────────────────────▼───────────────────────────────────┐
│               SERVER (Node.js + Express)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │  │Controller│  │Middleware│  │  Models  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ Mongoose ODM
┌─────────────────────────▼───────────────────────────────────┐
│                    DATABASE (MongoDB)                        │
│         Collections: Users, Products, Orders, etc.           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Firebase   │  │   Razorpay   │                        │
│  │     Auth     │  │   Payment    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Architecture Pattern
- **Frontend:** Component-based architecture using React
- **Backend:** RESTful API with MVC pattern
- **Database:** Document-based NoSQL (MongoDB)
- **Authentication:** JWT tokens + Firebase OAuth
- **State Management:** React Context API
- **Styling:** TailwindCSS + Shadcn/ui components

### 2.3 Communication Flow
1. Client sends HTTP requests to REST API endpoints
2. Express middleware validates authentication and authorization
3. Controllers process business logic
4. Models interact with MongoDB database
5. Response data sent back to client
6. React components render updated UI

---

## 3. TECHNOLOGY STACK

### 3.1 Frontend Technologies
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.1.1 | UI library for building components |
| Vite | 7.1.0 | Build tool and dev server |
| React Router DOM | 7.8.0 | Client-side routing |
| Axios | 1.11.0 | HTTP client for API calls |
| TailwindCSS | 3.4.17 | Utility-first CSS framework |
| Framer Motion | 12.23.19 | Animation library |
| Lucide React | 0.540.0 | Icon library |
| Recharts | 3.2.0 | Charting library for analytics |
| React Hot Toast | 2.6.0 | Toast notifications |
| Firebase | 12.1.0 | Authentication service |
| Radix UI | Various | Accessible UI components |

### 3.2 Backend Technologies
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | - | JavaScript runtime environment |
| Express.js | 5.1.0 | Web application framework |
| MongoDB | - | NoSQL database |
| Mongoose | 8.17.1 | MongoDB ODM |
| JWT | 9.0.2 | Token-based authentication |
| bcryptjs | 3.0.2 | Password hashing |
| Multer | 2.0.2 | File upload handling |
| Razorpay | 2.9.6 | Payment gateway integration |
| dotenv | 17.2.1 | Environment variable management |
| CORS | 2.8.5 | Cross-origin resource sharing |

### 3.3 Development Tools
- **Version Control:** Git
- **Testing:** Playwright (E2E testing)
- **Linting:** ESLint
- **Package Manager:** npm
- **Dev Server:** Nodemon (backend), Vite (frontend)

---

## 4. DATABASE SCHEMA

### 4.1 User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (nullable for Google users),
  phone: String,
  address: String,
  role: Enum ['admin', 'customer'] (default: 'customer'),
  status: Enum ['active', 'inactive'] (default: 'active'),
  lastLogin: Date,
  wishlist: [ObjectId] (ref: Product),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 4.2 Product Schema
```javascript
{
  name: String (required),
  category: Enum ['timber', 'furniture', 'construction'] (required),
  subcategory: String,
  quantity: Number (default: 0, min: 0),
  unit: Enum ['cubic ft', 'pieces', 'piece'] (default: 'pieces'),
  price: Number (required, min: 0),
  size: String,
  description: String (max: 1000 chars),
  images: [
    {
      data: String (base64 encoded),
      contentType: String,
      filename: String
    }
  ] (max 5 images),
  attributes: Mixed (flexible object),
  isActive: Boolean (default: true),
  featuredType: Enum ['best', 'new', 'discount', 'none', 'featured'],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 4.3 Order Schema
```javascript
{
  user: ObjectId (ref: User, required),
  items: [
    {
      product: ObjectId (ref: Product),
      name: String,
      price: Number,
      quantity: Number (min: 1),
      image: String
    }
  ],
  totalAmount: Number (required, min: 0),
  shippingCost: Number (default: 0),
  address: {
    name: String,
    phone: String,
    addressLine: String,
    city: String,
    state: String,
    zip: String
  },
  status: Enum ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
  paymentMethod: Enum ['COD', 'Online'],
  paymentStatus: Enum ['Pending', 'Paid', 'Failed', 'Refunded'],
  razorpayOrderId: String,
  razorpayPaymentId: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 4.4 Vendor Schema
```javascript
{
  name: String (required),
  contact: {
    email: String,
    phone: String (required),
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String (default: 'India')
    }
  },
  businessDetails: {
    gstNumber: String,
    panNumber: String,
    businessType: Enum ['individual', 'company', 'partnership']
  },
  status: Enum ['active', 'inactive', 'suspended'],
  totalIntake: {
    count: Number (default: 0),
    value: Number (default: 0)
  },
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 4.5 Cart Schema
```javascript
{
  user: ObjectId (ref: User, unique, required),
  items: [
    {
      product: ObjectId (ref: Product),
      quantity: Number (min: 1)
    }
  ],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 4.6 Stock Schema
```javascript
{
  name: String (required),
  category: Enum ['timber', 'furniture', 'construction'],
  quantity: Number (default: 0, min: 0),
  unit: Enum ['cubic ft', 'pieces'],
  attributes: Mixed,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 4.7 WoodIntake Schema
```javascript
{
  vendor: ObjectId (ref: Vendor, required),
  date: Date (required),
  woodType: String (required),
  quantity: Number (required, min: 0),
  unit: Enum ['cubic ft', 'pieces'],
  pricePerUnit: Number (min: 0),
  totalAmount: Number,
  status: Enum ['pending', 'approved', 'rejected'],
  notes: String
}
```

### 4.8 Address Schema
```javascript
{
  user: ObjectId (ref: User, required),
  name: String (required),
  phone: String (required),
  addressLine: String (required),
  city: String (required),
  state: String (required),
  zip: String (required),
  isDefault: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 4.9 Contact Schema
```javascript
{
  name: String (required),
  email: String (required),
  phone: String,
  subject: String (required),
  message: String (required),
  status: Enum ['new', 'in-progress', 'resolved'],
  reply: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 4.10 Blog Schema
```javascript
{
  title: String (required),
  content: String (required),
  author: String,
  category: String,
  image: String,
  published: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 4.11 FAQ Schema
```javascript
{
  question: String (required),
  answer: String (required),
  category: String,
  order: Number,
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 5. BACKEND MODULES

### 5.1 Authentication Module (`authController.js`)

**Functions:**

1. **register(req, res)**
   - Creates new user account
   - Validates email uniqueness
   - Hashes password with bcrypt
   - Assigns role (admin/customer)
   - Returns success message

2. **login(req, res)**
   - Validates credentials
   - Compares password hash
   - Generates JWT token
   - Returns token and user data

3. **googleSignIn(req, res)**
   - Handles Google OAuth authentication
   - Creates user if doesn't exist
   - Generates JWT token
   - Returns token and user data

4. **getUserProfile(req, res)**
   - Retrieves authenticated user's profile
   - Excludes password field
   - Returns user information

5. **updateProfile(req, res)**
   - Updates user information
   - Validates email uniqueness
   - Handles password change
   - Returns updated profile

6. **updateAddress(req, res)**
   - Updates user's default address
   - Validates address data
   - Returns success message

7. **changePassword(req, res)**
   - Verifies current password
   - Hashes new password
   - Updates password
   - Returns success message

### 5.2 Product Management Module (`productController.js`)

**Functions:**

1. **createProduct(req, res)**
   - Creates new product
   - Validates required fields
   - Processes image uploads (max 5)
   - Converts images to base64
   - Stores in MongoDB
   - Returns product data

2. **getAllProducts(req, res)**
   - Retrieves paginated products
   - Supports filtering (category, search, featured)
   - Supports sorting
   - Returns products with statistics
   - Includes low stock count

3. **getProductById(req, res)**
   - Retrieves single product
   - Validates product ID
   - Returns product details

4. **updateProduct(req, res)**
   - Updates existing product
   - Handles image updates
   - Validates data
   - Returns updated product

5. **deleteProduct(req, res)**
   - Soft deletes product (sets isActive: false)
   - Maintains data integrity
   - Returns success message

6. **removeProductImage(req, res)**
   - Removes specific image from product
   - Updates product record
   - Returns updated product

### 5.3 Order Management Module (`orderController.js`)

**Functions:**

1. **checkout(req, res)**
   - Creates new order
   - Validates cart items
   - Calculates total amount
   - Stores order in database
   - Clears user's cart
   - Returns order details

2. **getMyOrders(req, res)**
   - Retrieves customer's orders
   - Sorted by date (newest first)
   - Populates product details
   - Returns order list

3. **adminListOrders(req, res)**
   - Retrieves all orders (admin only)
   - Supports pagination
   - Populates user and product data
   - Returns comprehensive order list

4. **adminUpdateOrderStatus(req, res)**
   - Updates order status
   - Validates status values
   - Returns updated order

### 5.4 Cart Management Module (`cartController.js`)

**Functions:**

1. **addToCart(req, res)**
   - Adds product to cart
   - Creates cart if doesn't exist
   - Updates quantity if product exists
   - Returns updated cart

2. **getCart(req, res)**
   - Retrieves user's cart
   - Populates product details
   - Calculates subtotals
   - Returns cart with totals

3. **updateCartItem(req, res)**
   - Updates item quantity
   - Validates minimum quantity
   - Returns updated cart

4. **removeCartItem(req, res)**
   - Removes item from cart
   - Updates cart record
   - Returns success message

### 5.5 Wishlist Module (`wishlistController.js`)

**Functions:**

1. **addToWishlist(req, res)**
   - Adds product to user's wishlist
   - Prevents duplicates
   - Returns updated wishlist

2. **getWishlist(req, res)**
   - Retrieves user's wishlist
   - Populates product details
   - Returns wishlist items

3. **removeFromWishlist(req, res)**
   - Removes product from wishlist
   - Updates user record
   - Returns success message

### 5.6 Vendor Management Module (`vendorController.js`)

**Functions:**

1. **createVendor(req, res)**
   - Creates new vendor
   - Validates required fields
   - Returns vendor data

2. **getAllVendors(req, res)**
   - Retrieves all vendors
   - Supports search and filter
   - Returns vendor list

3. **getVendorById(req, res)**
   - Retrieves single vendor
   - Returns vendor details

4. **updateVendor(req, res)**
   - Updates vendor information
   - Validates data
   - Returns updated vendor

5. **deleteVendor(req, res)**
   - Deletes vendor record
   - Returns success message

6. **createWoodIntake(req, res)**
   - Records wood intake from vendor
   - Calculates total amount
   - Updates vendor statistics
   - Returns intake record

7. **getAllWoodIntakes(req, res)**
   - Retrieves wood intake records
   - Supports filtering by vendor
   - Returns intake list

8. **updateWoodIntakeStatus(req, res)**
   - Updates intake status
   - Returns updated record

9. **getVendorStats(req, res)**
   - Calculates vendor statistics
   - Returns analytics data

### 5.7 Stock Management Module (`stockController.js`)

**Functions:**

1. **createStock(req, res)**
   - Creates new stock record
   - Validates category and unit
   - Returns stock data

2. **getAllStock(req, res)**
   - Retrieves all stock items
   - Supports pagination and filtering
   - Returns stock list

3. **getStockById(req, res)**
   - Retrieves single stock item
   - Returns stock details

4. **updateStock(req, res)**
   - Updates stock information
   - Validates data
   - Returns updated stock

5. **deleteStock(req, res)**
   - Deletes stock record
   - Returns success message

6. **getLowStockItems(req, res)**
   - Identifies items with low stock
   - Returns items below threshold
   - Used for alerts

7. **updateStockQuantity(req, res)**
   - Updates stock quantity
   - Supports increment/decrement
   - Returns updated stock

### 5.8 Admin Dashboard Module (`adminController.js`)

**Functions:**

1. **getDashboardOverview(req, res)**
   - Aggregates system statistics
   - Calculates total users, products, orders
   - Calculates revenue
   - Returns comprehensive dashboard data

2. **getAllUsers(req, res)**
   - Retrieves all users
   - Supports search and filter
   - Returns user list

3. **getUserOrders(req, res)**
   - Retrieves specific user's orders
   - Returns order history

4. **updateUserStatus(req, res)**
   - Updates user status (active/inactive)
   - Returns updated user

5. **getUserCart(req, res)**
   - Retrieves user's cart (admin view)
   - Returns cart details

6. **getUserWishlist(req, res)**
   - Retrieves user's wishlist (admin view)
   - Returns wishlist items

### 5.9 Payment Module (`paymentController.js`)

**Functions:**

1. **createRazorpayOrder(req, res)**
   - Creates Razorpay order
   - Generates order ID
   - Returns order details for frontend

2. **verifyRazorpayPayment(req, res)**
   - Verifies payment signature
   - Updates order payment status
   - Clears user cart
   - Returns verification status

3. **createCODOrder(req, res)**
   - Creates Cash on Delivery order
   - Validates cart items
   - Calculates totals
   - Creates order record
   - Returns order details

### 5.10 Contact/Support Module (`contactController.js`)

**Functions:**

1. **submitContact(req, res)**
   - Creates new contact/support ticket
   - Validates required fields
   - Returns ticket data

2. **getAdminContacts(req, res)**
   - Retrieves all contact tickets (admin)
   - Supports filtering by status
   - Returns ticket list

3. **getContactById(req, res)**
   - Retrieves single ticket
   - Returns ticket details

4. **updateContact(req, res)**
   - Updates ticket status
   - Returns updated ticket

5. **replyToContact(req, res)**
   - Admin replies to ticket
   - Updates status to resolved
   - Returns updated ticket

6. **deleteContact(req, res)**
   - Deletes contact ticket
   - Returns success message

7. **getContactStats(req, res)**
   - Calculates ticket statistics
   - Returns analytics data

### 5.11 FAQ Module (`faqController.js`)

**Functions:**

1. **getAllFAQs(req, res)**
   - Retrieves active FAQs
   - Returns FAQ list

2. **getAdminFAQs(req, res)**
   - Retrieves all FAQs (admin)
   - Includes inactive FAQs
   - Returns FAQ list

3. **addFAQ(req, res)**
   - Creates new FAQ
   - Validates data
   - Returns FAQ record

4. **updateFAQ(req, res)**
   - Updates existing FAQ
   - Returns updated FAQ

5. **deleteFAQ(req, res)**
   - Deletes FAQ
   - Returns success message

6. **getFAQCategories(req, res)**
   - Retrieves FAQ categories
   - Returns category list

### 5.12 Blog Module (`blogController.js`)

**Functions:**

1. **getAllBlogs(req, res)**
   - Retrieves published blogs
   - Supports pagination
   - Returns blog list

2. **getAdminBlogs(req, res)**
   - Retrieves all blogs (admin)
   - Includes unpublished blogs
   - Returns blog list

3. **getBlogById(req, res)**
   - Retrieves single blog
   - Returns blog details

4. **addBlog(req, res)**
   - Creates new blog post
   - Handles image upload
   - Returns blog data

5. **updateBlog(req, res)**
   - Updates existing blog
   - Returns updated blog

6. **deleteBlog(req, res)**
   - Deletes blog post
   - Returns success message

7. **getBlogCategories(req, res)**
   - Retrieves blog categories
   - Returns category list

### 5.13 Address Module (`addressController.js`)

**Functions:**

1. **createAddress(req, res)**
   - Creates new address for user
   - Validates required fields
   - Returns address data

2. **getUserAddresses(req, res)**
   - Retrieves all addresses for user
   - Returns address list

3. **updateAddress(req, res)**
   - Updates existing address
   - Returns updated address

4. **deleteAddress(req, res)**
   - Deletes address record
   - Returns success message

5. **setDefaultAddress(req, res)**
   - Sets address as default
   - Unsets other defaults
   - Returns success message

### 5.14 Image Module (`imageController.js`)

**Functions:**

1. **getProductImage(req, res)**
   - Retrieves specific product image
   - Serves image from MongoDB
   - Returns image data

---

## 6. FRONTEND MODULES

### 6.1 Pages (25 Components)

#### 6.1.1 Public Pages

**HomePage.jsx**
- Landing page with hero section
- Featured products showcase
- Category highlights
- Testimonials
- Call-to-action sections

**LoginPage.jsx**
- User login form
- Email/password authentication
- Google Sign-In integration
- Link to registration
- Password reset functionality

**RegisterPage.jsx**
- User registration form
- Email verification
- Password validation
- Terms acceptance
- Redirect to login

**AboutUs.jsx**
- Company information
- Mission and vision
- Team details
- Company history

**ContactUs.jsx**
- Contact form
- Company contact details
- Location map
- Social media links

#### 6.1.2 Product Pages

**TimberProducts.jsx**
- Displays timber category products
- Product filtering
- Search functionality
- Add to cart/wishlist
- Pagination

**Furniture.jsx**
- Displays furniture category products
- Product grid layout
- Filter by subcategory
- Quick view functionality

**ConstructionMaterials.jsx**
- Displays construction materials
- Product specifications
- Bulk order options
- Price calculator

**ProductDetail.jsx**
- Detailed product information
- Image gallery
- Quantity selector
- Add to cart/wishlist
- Product specifications
- Related products

#### 6.1.3 Customer Pages

**CustomerHomePage.jsx**
- Personalized customer dashboard
- Recent orders
- Recommended products
- Quick actions

**CustomerProfile.jsx**
- User profile information
- Edit profile form
- Account settings
- Profile picture

**LoginSecurity.jsx**
- Change password
- Security settings
- Login history
- Two-factor authentication options

**AddressManagement.jsx**
- List all addresses
- Add new address
- Edit existing addresses
- Set default address
- Delete addresses

**Cart.jsx**
- Shopping cart items
- Quantity adjustment
- Remove items
- Apply coupons
- Checkout button
- Price summary

**Wishlist.jsx**
- Wishlist items
- Move to cart
- Remove from wishlist
- Share wishlist

**CheckoutPage.jsx**
- Order summary
- Address selection
- Payment method selection
- Order confirmation

**OrderSuccess.jsx**
- Order confirmation message
- Order details
- Download invoice
- Continue shopping

**OrderHistory.jsx**
- List all orders
- Order status tracking
- Order details view
- Reorder functionality
- Download invoices

#### 6.1.4 Admin Pages

**AdminDashboard.jsx**
- Overview statistics
- Sales charts
- Recent orders
- Low stock alerts
- User activity
- Revenue analytics
- Quick actions

**AdminVendors.jsx**
- Vendor list
- Add new vendor
- Edit vendor details
- View vendor statistics
- Wood intake records
- Vendor status management
- Payment history

**AdminStock.jsx**
- Stock inventory list
- Add new stock
- Update stock quantities
- Low stock alerts
- Stock transfer
- Category-wise view

**AdminProducts.jsx**
- Product catalog
- Add new product
- Edit product details
- Upload images
- Set featured products
- Product activation/deactivation

**AdminUsers.jsx**
- User list
- User details view
- User status management
- View user orders
- View user cart/wishlist
- Role management

**AdminOrders.jsx**
- All orders list
- Order status update
- Order details view
- Invoice generation
- Filter by status
- Search orders
- Export orders

**AdminSupport.jsx**
- Support tickets list
- Ticket status management
- Reply to tickets
- Close tickets
- Filter by status
- Ticket analytics

### 6.2 Components (37 Components)

#### 6.2.1 Layout Components

**Header.jsx**
- Navigation menu
- Logo
- User authentication state
- Shopping cart icon
- Search bar
- Mobile responsive menu

**Footer.jsx**
- Company information
- Quick links
- Social media links
- Newsletter subscription
- Contact information
- Copyright notice

**Sidebar.jsx (Admin)**
- Admin navigation menu
- Dashboard link
- Module links
- Logout option

#### 6.2.2 UI Components

**Hero.jsx**
- Main banner
- Call-to-action buttons
- Background image
- Animated elements

**CustomerHero.jsx**
- Customer dashboard banner
- Personalized greeting
- Quick stats

**ProductCard.jsx**
- Product image
- Product name
- Price display
- Add to cart button
- Wishlist button
- Product rating

**ProductShowcase.jsx**
- Featured products section
- Category-wise products
- Carousel/slider

**HighlightedCategories.jsx**
- Category cards
- Category images
- Navigation to category pages

**Testimonials.jsx**
- Customer reviews
- Rating display
- Review carousel

**WhyChooseUs.jsx**
- Company USPs
- Feature highlights
- Icon-based sections

**FAQ.jsx**
- Frequently asked questions
- Expandable answers
- Category-wise FAQs

**BlogInspiration.jsx**
- Blog posts preview
- Blog categories
- Read more links

**AboutUsSection.jsx**
- Company story
- Team information
- Mission statement

**ContactForm.jsx**
- Contact form fields
- Form validation
- Submit functionality

#### 6.2.3 Form Components

**ProductForm.jsx**
- Product creation/edit form
- Image upload
- Form validation
- Category selection
- Attribute management

**AddressSection.jsx**
- Address form
- Address validation
- State/city selection

**OrderSummarySection.jsx**
- Order items list
- Price breakdown
- Shipping cost
- Total amount

**PaymentSection.jsx**
- Payment method selection
- Razorpay integration
- COD option

#### 6.2.4 Admin Components

**admin/Header.jsx**
- Admin header
- User profile
- Notifications
- Logout

**admin/Sidebar.jsx**
- Admin navigation
- Active menu highlighting
- Collapsible menu

**admin/StatsCards.jsx**
- Statistic cards
- Number displays
- Trend indicators

**admin/QuickActions.jsx**
- Quick action buttons
- Shortcut links

**admin/SystemStatus.jsx**
- System health status
- Database connection
- API status

**admin/ProductCatalog.jsx**
- Product grid view
- Product list view
- Filter controls

**admin/ProductCatalogTabs.jsx**
- Category tabs
- Tab switching

**admin/LoadingStates.jsx**
- Loading spinners
- Skeleton loaders

**admin/ToastNotification.jsx**
- Success/error messages
- Auto-dismiss toasts

**admin/LogoutConfirmation.jsx**
- Logout confirmation modal
- Cancel/confirm actions

**admin/modals/OrdersModal.jsx**
- Order details modal
- Status update

**admin/modals/ProductsModal.jsx**
- Product edit modal
- Image management

**admin/modals/UsersModal.jsx**
- User details modal
- Role update

#### 6.2.5 Utility Components

**ProtectedRoute.jsx**
- Route authentication
- Role-based access control
- Redirect to login

**NotificationProvider.jsx**
- Global notification system
- Toast management

**Notification.jsx**
- Notification component
- Success/error/info types

#### 6.2.6 UI Library Components (Shadcn/ui)

**ui/button.jsx**
- Reusable button component
- Multiple variants

**ui/card.jsx**
- Card container
- Header, content, footer

**ui/input.jsx**
- Form input component
- Validation styling

**ui/label.jsx**
- Form label component
- Accessibility support

### 6.3 Contexts

**CartContext.jsx**
- Global cart state
- Cart actions (add, remove, update)
- Cart persistence
- Cart count

### 6.4 Custom Hooks

**useAuth.js**
- Authentication state
- Login/logout functions
- User data

**useDebounce.js**
- Debounce input values
- Performance optimization

**useLocalStorage.js**
- Persist data in local storage
- Sync state with storage

### 6.5 Utilities

**axios.js**
- Axios configuration
- API base URL
- Request/response interceptors
- Token management

**utils.js**
- Helper functions
- Date formatting
- Price formatting
- String manipulation

**firebase.js**
- Firebase configuration
- Authentication setup
- Google Sign-In
- Password reset

---

## 7. API ENDPOINTS

### 7.1 Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/google-signin` | Google OAuth login | No |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| PUT | `/address` | Update address | Yes |
| PUT | `/change-password` | Change password | Yes |

### 7.2 Product Routes (`/api/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all products | No |
| GET | `/:id` | Get single product | No |
| POST | `/` | Create product | Admin |
| PUT | `/:id` | Update product | Admin |
| DELETE | `/:id` | Delete product | Admin |
| DELETE | `/:id/image` | Remove product image | Admin |

### 7.3 Cart Routes (`/api`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cart` | Get user's cart | Yes |
| POST | `/cart` | Add to cart | Yes |
| PUT | `/cart/:productId` | Update cart item | Yes |
| DELETE | `/cart/:productId` | Remove from cart | Yes |

### 7.4 Order Routes (`/api`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/checkout` | Create order | Customer |
| GET | `/orders` | Get my orders | Customer |

### 7.5 Wishlist Routes (`/api`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/wishlist` | Get wishlist | Customer |
| POST | `/wishlist` | Add to wishlist | Customer |
| DELETE | `/wishlist/:productId` | Remove from wishlist | Customer |

### 7.6 Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get dashboard stats | Admin |
| GET | `/users` | Get all users | Admin |
| GET | `/users/:userId/orders` | Get user orders | Admin |
| PUT | `/users/:userId/status` | Update user status | Admin |
| GET | `/users/:userId/cart` | Get user cart | Admin |
| GET | `/users/:userId/wishlist` | Get user wishlist | Admin |
| GET | `/orders` | Get all orders | Admin |
| PUT | `/orders/:orderId` | Update order status | Admin |

### 7.7 Vendor Routes (`/api/vendors`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all vendors | Admin |
| GET | `/:id` | Get vendor by ID | Admin |
| POST | `/` | Create vendor | Admin |
| PUT | `/:id` | Update vendor | Admin |
| DELETE | `/:id` | Delete vendor | Admin |
| POST | `/wood-intake` | Create wood intake | Admin |
| GET | `/wood-intakes` | Get all intakes | Admin |
| PUT | `/wood-intake/:id` | Update intake status | Admin |
| GET | `/:id/stats` | Get vendor statistics | Admin |

### 7.8 Stock Routes (`/api/stock`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all stock | Admin |
| GET | `/:id` | Get stock by ID | Admin |
| POST | `/` | Create stock | Admin |
| PUT | `/:id` | Update stock | Admin |
| DELETE | `/:id` | Delete stock | Admin |
| GET | `/low-stock` | Get low stock items | Admin |
| PATCH | `/:id/quantity` | Update stock quantity | Admin |

### 7.9 Address Routes (`/api/addresses`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user addresses | Yes |
| POST | `/` | Create address | Yes |
| PUT | `/:id` | Update address | Yes |
| DELETE | `/:id` | Delete address | Yes |
| PUT | `/:id/default` | Set default address | Yes |

### 7.10 Contact Routes (`/api/contacts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Submit contact form | No |
| GET | `/admin` | Get all contacts | Admin |
| GET | `/:id` | Get contact by ID | Admin |
| PUT | `/:id` | Update contact | Admin |
| POST | `/:id/reply` | Reply to contact | Admin |
| DELETE | `/:id` | Delete contact | Admin |
| GET | `/stats` | Get contact stats | Admin |

### 7.11 FAQ Routes (`/api/faqs`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all FAQs | No |
| GET | `/admin` | Get all FAQs (admin) | Admin |
| POST | `/` | Create FAQ | Admin |
| PUT | `/:id` | Update FAQ | Admin |
| DELETE | `/:id` | Delete FAQ | Admin |
| GET | `/categories` | Get FAQ categories | No |

### 7.12 Blog Routes (`/api/blogs`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get published blogs | No |
| GET | `/admin` | Get all blogs | Admin |
| GET | `/:id` | Get blog by ID | No |
| POST | `/` | Create blog | Admin |
| PUT | `/:id` | Update blog | Admin |
| DELETE | `/:id` | Delete blog | Admin |
| GET | `/categories` | Get blog categories | No |

### 7.13 Payment Routes (`/api/payment`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create-order` | Create Razorpay order | Customer |
| POST | `/verify` | Verify Razorpay payment | Customer |
| POST | `/cod` | Create COD order | Customer |

### 7.14 Image Routes (`/api/images`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/:productId/:imageIndex` | Get product image | No |

---

## 8. KEY FEATURES

### 8.1 User Management
- User registration and authentication
- Role-based access control (Admin/Customer)
- Google OAuth integration
- Profile management
- Password change functionality
- User status management (active/inactive)

### 8.2 Product Management
- Product CRUD operations
- Image upload (max 5 images per product)
- Category management (timber, furniture, construction)
- Product attributes (flexible schema)
- Featured product designation
- Soft delete (isActive flag)
- Low stock alerts

### 8.3 Shopping Experience
- Product browsing with filters
- Search functionality
- Product detail pages
- Shopping cart management
- Wishlist functionality
- Multiple payment methods (Razorpay, COD)
- Order tracking
- Order history

### 8.4 Vendor Management
- Vendor registration
- Vendor profile management
- Wood intake tracking
- Vendor statistics
- Status management

### 8.5 Inventory Management
- Stock tracking
- Stock quantity updates
- Low stock alerts
- Category-wise inventory
- Stock transfer records

### 8.6 Order Processing
- Order creation
- Order status workflow
- Payment processing
- Invoice generation
- Order fulfillment tracking

### 8.7 Admin Dashboard
- Comprehensive analytics
- Sales reports
- Revenue tracking
- User activity monitoring
- Inventory overview
- Order management

### 8.8 Customer Support
- Contact form
- Support ticket system
- Ticket status tracking
- Admin replies
- FAQ management
- Blog for customer education

### 8.9 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Protected API routes
- CORS configuration
- Input validation

### 8.10 Performance Features
- Pagination
- Image optimization (base64 encoding)
- Database indexing
- Lazy loading
- Debounced search
- Caching strategies

---

## 9. CONCLUSION

### 9.1 Project Summary
JC-Timbers is a comprehensive, production-ready e-commerce platform specifically designed for the timber and furniture industry. The application successfully integrates modern web technologies to provide a seamless experience for both administrators and customers. With features ranging from vendor management and inventory control to online shopping and payment processing, the platform addresses all critical aspects of running a timber business online.

### 9.2 Technical Achievements
- **Full-Stack Implementation:** Complete MERN stack application with proper separation of concerns
- **Scalable Architecture:** RESTful API design with modular components
- **Security:** Robust authentication and authorization system
- **User Experience:** Responsive design with modern UI components
- **Payment Integration:** Multiple payment methods including Razorpay gateway
- **Role-Based Access:** Separate interfaces for admin and customers
- **Data Management:** Comprehensive database schema with proper relationships
- **Image Handling:** Efficient image storage and retrieval system

### 9.3 Business Impact
The platform enables JC-Timbers to:
- Expand market reach through online presence
- Streamline operations with automated inventory management
- Improve customer experience with easy browsing and ordering
- Track vendor relationships and wood intake efficiently
- Make data-driven decisions with analytics dashboard
- Reduce operational costs through automation
- Provide better customer support

### 9.4 Future Enhancements
Potential future improvements include:
- Mobile application (React Native)
- Real-time notifications (WebSockets)
- Advanced analytics with AI/ML
- Multi-language support
- Advanced reporting and exports
- Integration with accounting software
- Customer loyalty program
- Product recommendation engine
- Live chat support
- SMS/Email notifications
- Barcode/QR code scanning
- Warehouse management system

### 9.5 Conclusion Statement
JC-Timbers represents a modern, scalable solution for the timber industry's digital transformation. The platform successfully combines robust backend functionality with an intuitive frontend interface, providing a complete business solution. With its comprehensive feature set, security measures, and growth potential, JC-Timbers is well-positioned to serve the evolving needs of the timber and furniture e-commerce market.

---

## APPENDIX

### A. Installation Guide

**Prerequisites:**
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

**Backend Setup:**
```bash
cd server
npm install
# Create .env file with required variables
npm run dev
```

**Frontend Setup:**
```bash
cd client
npm install
npm run dev
```

### B. Environment Variables

**Server (.env):**
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/jc-timbers
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
CLIENT_ORIGIN=http://localhost:5173
```

**Client (.env):**
```
VITE_API_URL=http://localhost:5001
VITE_FIREBASE_API_KEY=your-firebase-key
```

### C. Deployment

**Backend Deployment:**
- Platform: Heroku, AWS, DigitalOcean
- Database: MongoDB Atlas
- Environment variables configured
- CORS settings updated

**Frontend Deployment:**
- Platform: Vercel, Netlify
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables configured

### D. Testing

**E2E Tests (Playwright):**
```bash
cd client
npm run test
npm run test:ui
```

**Test Coverage:**
- Homepage tests
- Login/Registration tests
- Product browsing tests
- Cart functionality tests
- Checkout process tests

### E. API Documentation
Complete API documentation available at: `/api-docs` (when Swagger is integrated)

### F. Database Indexes
- Users: email (unique)
- Products: category, isActive, featuredType
- Orders: user, status, createdAt
- Cart: user (unique)

### G. Security Considerations
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens (recommended)
- Rate limiting (recommended)
- HTTPS in production

### H. Performance Optimization
- Database query optimization
- Image compression
- Lazy loading
- Code splitting
- Caching strategies
- CDN for static assets

---

**END OF DOCUMENTATION**

---

**Contact Information:**
- Project Repository: [GitHub Link]
- Documentation: [Link]
- Support: [Email]

**Version History:**
- v1.0.0 (October 2025) - Initial Release

**License:** [License Type]

---

*This documentation is comprehensive and covers all aspects of the JC-Timbers E-Commerce Platform. For any queries or clarifications, please contact the development team.*

