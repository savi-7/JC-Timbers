# Vendor Management System Documentation

## Overview
A comprehensive vendor management system for timber businesses that allows admins to manage vendors, log wood intake, and track inventory. The system includes both backend APIs and frontend interface.

## Backend Architecture

### **Database Models**

#### **Vendor Model (`server/src/models/Vendor.js`)**
```javascript
{
  name: String (required),
  contact: {
    email: String (optional - for local vendors without email),
    phone: String (required),
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String (default: "India")
    }
  },
  businessDetails: {
    gstNumber: String,
    panNumber: String,
    businessType: String (enum: ['individual', 'company', 'partnership'])
  },
  status: String (enum: ['active', 'inactive', 'suspended']),
  totalIntake: {
    count: Number (default: 0),
    value: Number (default: 0)
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### **Wood Intake Model (`server/src/models/WoodIntake.js`)**
```javascript
{
  vendorId: ObjectId (ref: 'Vendor'),
  woodDetails: {
    type: String (enum: ['teak', 'rosewood', 'pine', 'oak', 'cedar', 'mahogany', 'bamboo', 'plywood', 'other']),
    subtype: String,
    dimensions: {
      length: Number (feet),
      width: Number (inches),
      thickness: Number (inches),
      quantity: Number (pieces)
    },
    quality: String (enum: ['premium', 'grade_a', 'grade_b', 'standard']),
    condition: String (enum: ['excellent', 'good', 'fair', 'poor'])
  },
  costDetails: {
    unitPrice: Number,
    totalCost: Number (auto-calculated),
    currency: String (default: 'INR'),
    paymentStatus: String (enum: ['pending', 'partial', 'paid']),
    paymentMethod: String (enum: ['cash', 'bank_transfer', 'cheque', 'upi'])
  },
  logistics: {
    deliveryDate: Date,
    deliveryMethod: String (enum: ['pickup', 'delivery']),
    location: {
      warehouse: String,
      section: String,
      rack: String
    }
  },
  notes: String,
  status: String (enum: ['pending', 'received', 'verified', 'rejected']),
  verifiedBy: ObjectId (ref: 'User'),
  verifiedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **API Endpoints**

#### **Vendor Management**
- `POST /api/vendors` - Create new vendor
- `GET /api/vendors` - Get all vendors (with pagination, search, filtering)
- `GET /api/vendors/stats` - Get vendor statistics
- `GET /api/vendors/:id` - Get vendor by ID with recent intakes
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor (if no intakes exist)

#### **Wood Intake Management**
- `POST /api/vendors/intake` - Log new wood intake
- `GET /api/vendors/intake/all` - Get all wood intakes (with pagination, filtering)
- `PUT /api/vendors/intake/:id/status` - Update intake status

### **Authentication & Authorization**
- All routes require JWT authentication (`authenticateToken`)
- All routes require admin role (`requireAdmin`)
- Automatic vendor intake count/value updates

## Frontend Architecture

### **Admin Vendors Page (`/admin/vendors`)**

#### **Features**
1. **Statistics Dashboard** - 4 key metrics cards
2. **Vendor Management** - Add new vendors
3. **Wood Intake Logging** - Log wood intake with detailed specifications
4. **Vendor Table** - Display all vendors with key information
5. **Intake History Table** - Show recent wood intakes

#### **Statistics Cards**
- **Total Vendors** - Count with active vendors
- **Total Intakes** - Count with pending intakes
- **Total Value** - Total value of all intakes in INR
- **Top Vendors** - Count of top-performing vendors

#### **Vendor Form**
- Vendor name, phone (required)
- Email (optional - for local vendors)
- Business type selection
- Address information
- GST/PAN numbers (optional)

#### **Wood Intake Form**
- Vendor selection dropdown
- Wood type and specifications
- Dimensions (length, width, thickness, quantity)
- Cost details (unit price, payment method)
- Delivery information
- Quality and condition assessment
- Notes field

#### **Tables**
- **Vendors Table**: Name, Contact, Business Type, Total Intakes, Status, Created Date
- **Intakes Table**: Vendor, Wood Type, Dimensions, Quantity, Cost, Status, Date

### **Navigation Integration**
- Added "Vendor Management" button to Admin Dashboard
- Clicking navigates to `/admin/vendors`
- Protected route requiring admin authentication

## Technical Implementation

### **Backend Features**
- **MongoDB Integration** - Mongoose ODM with proper schemas
- **Data Validation** - Comprehensive validation rules
- **Auto-calculations** - Total cost calculation
- **Referential Integrity** - Vendor-intake relationships
- **Pagination** - Efficient data loading
- **Search & Filtering** - Advanced query capabilities
- **Error Handling** - Comprehensive error management

### **Frontend Features**
- **React Hooks** - useState, useEffect for state management
- **Axios Integration** - HTTP client with JWT authentication
- **Modal Forms** - User-friendly form interfaces
- **Responsive Design** - Tailwind CSS with mobile-first approach
- **Real-time Updates** - Automatic data refresh after operations
- **Error Handling** - Graceful error states with retry functionality

### **Security Features**
- **JWT Authentication** - Secure token-based authentication
- **Role-based Access** - Admin-only access control
- **Input Validation** - Client and server-side validation
- **Data Sanitization** - Proper data cleaning and validation

## Usage Instructions

### **1. Access Vendor Management**
1. Login as admin: `adminjctimber@12` / `jctimber123`
2. Go to Admin Dashboard: `/admin/dashboard`
3. Click "Vendor Management" button
4. Navigate to `/admin/vendors`

### **2. Add New Vendor**
1. Click "Add New Vendor" button
2. Fill in vendor details:
   - Name, phone (required)
   - Email (optional - for local vendors)
   - Business type selection
   - Optional address and business details
3. Click "Create Vendor"

### **3. Log Wood Intake**
1. Click "Log Wood Intake" button
2. Select vendor from dropdown
3. Enter wood details:
   - Type, dimensions, quantity
   - Cost information
   - Delivery details
   - Quality assessment
4. Click "Log Intake"

### **4. View Data**
- **Vendor Table**: See all vendors with key metrics
- **Intake History**: View recent wood intakes
- **Statistics**: Monitor business metrics

## API Examples

### **Create Vendor**
```bash
curl -X POST http://localhost:5001/api/vendors \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Timber Suppliers",
    "contact": {
      "email": "contact@abctimber.com",
      "phone": "+91-9876543210",
      "address": {
        "street": "123 Timber Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
      }
    },
    "businessDetails": {
      "businessType": "company",
      "gstNumber": "27ABCDE1234F1Z5"
    }
  }'
```

### **Log Wood Intake**
```bash
curl -X POST http://localhost:5001/api/vendors/intake \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "VENDOR_ID",
    "woodDetails": {
      "type": "teak",
      "dimensions": {
        "length": 12,
        "width": 8,
        "thickness": 2,
        "quantity": 50
      },
      "quality": "grade_a",
      "condition": "excellent"
    },
    "costDetails": {
      "unitPrice": 2500,
      "paymentStatus": "pending",
      "paymentMethod": "bank_transfer"
    },
    "logistics": {
      "deliveryDate": "2024-01-20",
      "deliveryMethod": "delivery"
    },
    "notes": "Premium quality teak wood"
  }'
```

## Database Schema

### **Collections**
- **vendors** - Vendor information and business details
- **woodintakes** - Wood intake records with specifications
- **users** - Admin users for authentication

### **Relationships**
- `WoodIntake.vendorId` → `Vendor._id` (Many-to-One)
- `WoodIntake.verifiedBy` → `User._id` (Many-to-One)

### **Indexes**
- Vendor email (unique)
- Wood intake vendor ID
- Wood intake creation date
- Wood intake status

## Testing

### **Manual Testing**
1. **Create Vendor** - Test vendor creation form
2. **Log Intake** - Test wood intake logging
3. **View Tables** - Verify data display
4. **Statistics** - Check metric calculations
5. **Navigation** - Test route protection

### **API Testing**
```bash
# Test vendor creation
curl -X POST http://localhost:5001/api/vendors -H "Authorization: Bearer TOKEN" -d '{"name":"Test Vendor","contact":{"email":"test@example.com","phone":"1234567890"}}'

# Test intake logging
curl -X POST http://localhost:5001/api/vendors/intake -H "Authorization: Bearer TOKEN" -d '{"vendorId":"ID","woodDetails":{"type":"teak","dimensions":{"length":10,"width":6,"thickness":2,"quantity":25}},"costDetails":{"unitPrice":2000}}'
```

## Future Enhancements

### **Planned Features**
- **Vendor Performance Analytics** - Detailed vendor metrics
- **Wood Quality Tracking** - Quality assessment over time
- **Inventory Integration** - Automatic stock updates
- **Payment Tracking** - Payment status management
- **Reporting** - Comprehensive reports and analytics
- **Mobile App** - Mobile interface for field operations

### **Performance Optimizations**
- **Caching** - Redis for frequently accessed data
- **Pagination** - Efficient large dataset handling
- **Search Optimization** - Full-text search capabilities
- **Image Upload** - Wood quality photos

## Troubleshooting

### **Common Issues**
1. **Vendor Creation Fails**
   - Check email uniqueness
   - Verify required fields
   - Check JWT token validity

2. **Intake Logging Issues**
   - Verify vendor exists
   - Check dimension calculations
   - Validate cost calculations

3. **Data Not Loading**
   - Check server connection
   - Verify authentication
   - Check API endpoints

### **Debug Steps**
1. **Check Console** - Look for JavaScript errors
2. **Network Tab** - Verify API calls
3. **Server Logs** - Check backend errors
4. **Database** - Verify data integrity

## Summary

The Vendor Management System provides:
- ✅ **Complete vendor lifecycle management**
- ✅ **Detailed wood intake logging**
- ✅ **Real-time statistics and analytics**
- ✅ **Responsive admin interface**
- ✅ **Secure API endpoints**
- ✅ **Comprehensive data validation**
- ✅ **Professional UI/UX design**
- ✅ **Scalable architecture**

The system is ready for production use and can handle multiple vendors, extensive wood intake logging, and comprehensive business analytics!
