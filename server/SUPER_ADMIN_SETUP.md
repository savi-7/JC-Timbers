# Super Admin Setup Instructions

## Overview
The system has been updated to use "super_admin" instead of "admin" role. A specific super admin user has been created with the credentials you provided.

## Super Admin Credentials
- **Email:** `adminjctimber@12`
- **Password:** `jctimber123`
- **Role:** `super_admin`
- **Name:** `JC Timber Super Admin`

## Setup Instructions

### 1. Create Super Admin User in MongoDB
Run the following command in your server directory:

```bash
cd server
node create-super-admin.js
```

This script will:
- Connect to your MongoDB database
- Create or update the super admin user with the specified credentials
- Verify the user was created successfully

### 2. Test the Super Admin Login
You can test the super admin login using:

```bash
# Test with curl
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "adminjctimber@12",
    "password": "jctimber123"
  }'
```

Or use the test script:
```bash
node test-role-based-auth.js
```

### 3. Frontend Login
In your React application, you can now login with:
- **Email:** `adminjctimber@12`
- **Password:** `jctimber123`

After login, you'll be redirected to `/admin/dashboard` (Super Admin Dashboard).

## Changes Made

### Backend Changes:
1. **User Model** - Updated role enum to `['super_admin', 'customer']`
2. **Auth Controller** - Updated role validation for super_admin
3. **Middleware** - Updated `requireSuperAdmin` middleware
4. **Protected Routes** - Updated to use super_admin role
5. **Test Script** - Updated to test super_admin functionality

### Frontend Changes:
1. **LoginPage** - Updated redirect logic for super_admin
2. **ProtectedRoute** - Updated role checking for super_admin
3. **AdminDashboard** - Updated UI to show "Super Admin" instead of "Admin"
4. **App.jsx** - Updated protected routes to use super_admin role

## Role-Based Access Control

### Super Admin Access:
- ✅ `/admin/dashboard` - Super Admin Dashboard
- ✅ `/admin/users` - User Management
- ✅ `/admin/reports` - Reports and Analytics
- ✅ `/shared/settings` - Shared Settings

### Customer Access:
- ✅ `/shop` - Customer Shop
- ✅ `/customer/profile` - Customer Profile
- ✅ `/customer/orders` - Customer Orders
- ✅ `/shared/settings` - Shared Settings

### Access Restrictions:
- ❌ Super Admin **cannot** access `/shop` routes
- ❌ Customer **cannot** access `/admin/*` routes
- ❌ Unauthenticated users redirected to `/login`

## Security Features

1. **Role Validation** - Server-side role checking
2. **JWT Token** - Includes role information
3. **Automatic Redirects** - Based on user role
4. **Protected Routes** - Client and server-side protection
5. **Data Validation** - Role enum validation

## Testing

### Manual Testing:
1. **Login as Super Admin** → Should redirect to `/admin/dashboard`
2. **Login as Customer** → Should redirect to `/shop`
3. **Try wrong route** → Should redirect to correct dashboard

### Automated Testing:
```bash
node test-role-based-auth.js
```

This will test:
- Super admin registration and login
- Customer registration and login
- Route access control
- Role-based redirects

## Troubleshooting

### If Super Admin Login Fails:
1. Check if the user exists in MongoDB
2. Verify the password is correct
3. Check server logs for errors
4. Ensure MongoDB connection is working

### If Routes Don't Work:
1. Check if the role is correctly set in localStorage
2. Verify the ProtectedRoute component is working
3. Check browser console for errors
4. Ensure the server is running

## Next Steps

1. **Run the admin creation script**
2. **Test the login with the provided credentials**
3. **Verify access control is working**
4. **Customize the admin dashboard as needed**

The system is now ready with admin functionality!
