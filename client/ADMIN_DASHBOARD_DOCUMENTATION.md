# Admin Dashboard Documentation

## Overview
The Admin Dashboard is a comprehensive React component built with Tailwind CSS that provides super admin users with real-time insights into their timber business operations.

## Features

### 📊 **Dashboard Statistics**
- **Total Stock Count** - Shows total inventory units and low stock alerts
- **Pending Orders** - Displays number of pending orders and total value
- **Monthly Revenue** - Shows current month revenue with growth percentage
- **Active Users** - Displays active users and new registrations this month

### 📋 **Stock Management**
- **Category-wise Stock** - Shows stock levels for different wood types:
  - Teak Wood, Rosewood, Pine Wood, Oak Wood
  - Cedar Wood, Mahogany, Bamboo, Plywood
- **Low Stock Alerts** - Color-coded indicators for stock levels
- **Stock Status** - Visual representation of inventory health

### 📦 **Order Management**
- **Pending Orders Table** - Detailed view of all pending orders
- **Order Information** - Order ID, Customer, Items, Amount, Status, Date
- **Status Tracking** - Pending, Processing, Completed statuses
- **Value Calculation** - Total value of pending orders

### 🔔 **Recent Activities**
- **Real-time Updates** - Latest business activities
- **Activity Types** - Orders, Stock updates, User registrations
- **Timestamps** - When each activity occurred
- **Color-coded Indicators** - Different colors for different activity types

## API Endpoints

### GET `/api/admin/overview`
**Authentication:** Super Admin only (Bearer token required)

**Response Structure:**
```json
{
  "message": "Super Admin Dashboard Overview",
  "user": { "id": "...", "role": "super_admin" },
  "stockCount": {
    "total": 1247,
    "lowStock": 23,
    "categories": [
      { "name": "Teak Wood", "stock": 156 },
      { "name": "Rosewood", "stock": 89 }
    ]
  },
  "pendingOrders": {
    "total": 47,
    "totalValue": 1250000,
    "orders": [
      {
        "id": "ORD-2024-001",
        "customer": "Rajesh Kumar",
        "items": "Teak Dining Table",
        "amount": 45000,
        "status": "pending",
        "date": "2024-01-15"
      }
    ]
  },
  "recentActivities": [
    {
      "type": "order",
      "description": "New order #ORD-2024-001 placed by Rajesh Kumar",
      "timestamp": "2 hours ago"
    }
  ],
  "revenue": {
    "monthly": 1250000,
    "growth": 12.5,
    "daily": 45000,
    "weekly": 280000
  },
  "users": {
    "active": 1247,
    "newThisMonth": 89,
    "total": 2156
  }
}
```

## Component Structure

### **AdminDashboard.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data fetching
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Render dashboard with Tailwind CSS
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header, Stats, Tables, etc. */}
    </div>
  );
}
```

## Styling with Tailwind CSS

### **Color Scheme**
- **Primary:** Purple (Super Admin theme)
- **Success:** Green (Stock, Revenue)
- **Warning:** Yellow (Pending Orders)
- **Info:** Blue (Stock Count)
- **Danger:** Red (Logout, Errors)

### **Layout Classes**
- **Grid System:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Spacing:** `gap-6`, `p-6`, `py-4`
- **Shadows:** `shadow`, `shadow-sm`
- **Borders:** `border`, `border-b`, `rounded-lg`

### **Responsive Design**
- **Mobile:** Single column layout
- **Tablet:** 2-column grid for stats
- **Desktop:** 4-column grid for stats, 2-column for content

## Usage Instructions

### **1. Access the Dashboard**
1. Login as super admin with credentials:
   - Email: `adminjctimber@12`
   - Password: `jctimber123`
2. You'll be automatically redirected to `/admin/dashboard`

### **2. View Dashboard Data**
- **Stats Cards** - Top 4 cards show key metrics
- **Recent Activities** - Left panel shows latest activities
- **Stock Status** - Right panel shows inventory levels
- **Pending Orders** - Bottom table shows all pending orders

### **3. Interact with Dashboard**
- **Refresh Data** - Click retry button if error occurs
- **Logout** - Click logout button to exit
- **Responsive** - Dashboard adapts to different screen sizes

## Error Handling

### **Loading States**
- **Loading Spinner** - Shows while fetching data
- **Error Messages** - Displays if API call fails
- **Retry Button** - Allows manual refresh

### **Authentication**
- **Token Validation** - Checks JWT token validity
- **Role Verification** - Ensures super admin access
- **Redirect Logic** - Redirects unauthorized users

## Testing

### **Manual Testing**
1. **Login Test** - Verify super admin login works
2. **Data Loading** - Check if dashboard data loads
3. **Responsive Test** - Test on different screen sizes
4. **Error Handling** - Test with invalid token

### **API Testing**
```bash
# Test the overview API
curl -X GET http://localhost:5001/api/admin/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Automated Testing**
```bash
# Run the test script
node test-role-based-auth.js
```

## Security Features

### **Authentication**
- **JWT Token** - Required for all API calls
- **Role-based Access** - Super admin only
- **Token Expiry** - Automatic logout on token expiry

### **Data Protection**
- **HTTPS** - Secure data transmission
- **Input Validation** - Server-side validation
- **Error Handling** - Secure error messages

## Future Enhancements

### **Planned Features**
- **Real-time Updates** - WebSocket integration
- **Export Functionality** - PDF/Excel export
- **Advanced Filtering** - Filter orders by date, status
- **Charts & Graphs** - Visual data representation
- **Notifications** - Real-time alerts
- **Mobile App** - React Native version

### **Performance Optimizations**
- **Caching** - Redis for API responses
- **Pagination** - Large dataset handling
- **Lazy Loading** - Component-based loading
- **Image Optimization** - Compressed assets

## Troubleshooting

### **Common Issues**
1. **Dashboard Not Loading**
   - Check if server is running
   - Verify JWT token is valid
   - Check browser console for errors

2. **Data Not Updating**
   - Refresh the page
   - Check network connection
   - Verify API endpoint is working

3. **Styling Issues**
   - Ensure Tailwind CSS is loaded
   - Check for CSS conflicts
   - Verify responsive classes

### **Debug Steps**
1. **Check Console** - Look for JavaScript errors
2. **Network Tab** - Verify API calls are successful
3. **Token Validation** - Ensure JWT is valid
4. **Role Check** - Confirm user has super admin role

## Support

For technical support or questions about the Admin Dashboard:
- Check the console for error messages
- Verify API endpoints are working
- Ensure proper authentication
- Test with the provided test script

The Admin Dashboard provides a comprehensive view of your timber business operations with real-time data and intuitive user interface.

