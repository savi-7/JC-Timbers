# React Role-Based Authentication System

## Overview
This React application now supports role-based authentication with automatic redirects based on user roles.

## Features Implemented

### 1. Role-Based Login Flow
- **Admin Login** → Redirects to `/admin/dashboard`
- **Customer Login** → Redirects to `/shop`
- **Google Sign-In** → Also supports role-based redirects
- **JWT + Role Storage** → Saves token, user data, and role in localStorage

### 2. ProtectedRoute Component
- **Role Validation** → Checks if user has required role
- **Authentication Check** → Verifies JWT token exists
- **Automatic Redirects** → Redirects unauthorized users to appropriate pages
- **Fallback Handling** → Handles corrupted localStorage data

### 3. Protected Routes
- **Admin Routes** → `/admin/dashboard` (admin only)
- **Customer Routes** → `/shop` (customer only)
- **Public Routes** → `/`, `/home`, `/login`, `/register`

### 4. Authentication Hook
- **useAuth Hook** → Centralized authentication state management
- **Login/Logout** → Handles authentication state changes
- **Role Checking** → Utility functions for role validation
- **Auto-refresh** → Checks authentication status on app load

## Usage Examples

### ProtectedRoute Usage
```jsx
// Admin-only route
<Route 
  path="/admin/dashboard" 
  element={
    <ProtectedRoute role="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>

// Customer-only route
<Route 
  path="/shop" 
  element={
    <ProtectedRoute role="customer">
      <CustomerShop />
    </ProtectedRoute>
  } 
/>
```

### useAuth Hook Usage
```jsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, role, isAuthenticated, logout, hasRole } = useAuth();

  if (hasRole('admin')) {
    // Show admin content
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <p>Role: {role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Testing the System

### 1. Register Test Users
```bash
# Register Admin User
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}

# Register Customer User
POST /api/auth/register
{
  "name": "Customer User",
  "email": "customer@example.com",
  "password": "customer123",
  "role": "customer"
}
```

### 2. Test Login Flow
1. **Login as Admin** → Should redirect to `/admin/dashboard`
2. **Login as Customer** → Should redirect to `/shop`
3. **Try accessing wrong route** → Should redirect to correct dashboard

### 3. Test Access Control
1. **Admin tries to access `/shop`** → Redirected to `/admin/dashboard`
2. **Customer tries to access `/admin/dashboard`** → Redirected to `/shop`
3. **Unauthenticated user** → Redirected to `/login`

## Security Features

### 1. Token Validation
- JWT token verification
- Automatic token expiration handling
- Corrupted data cleanup

### 2. Role Enforcement
- Server-side role validation
- Client-side role checking
- Automatic role-based redirects

### 3. Data Protection
- Secure localStorage handling
- Automatic cleanup on errors
- Fallback authentication checks

## File Structure
```
client/src/
├── components/
│   └── ProtectedRoute.jsx     # Route protection component
├── hooks/
│   └── useAuth.js            # Authentication hook
├── pages/
│   ├── LoginPage.jsx         # Updated with role redirects
│   ├── AdminDashboard.jsx    # Admin-only page
│   └── CustomerShop.jsx      # Customer-only page
└── App.jsx                   # Updated with protected routes
```

## Error Handling

### 1. Authentication Errors
- **401 Unauthorized** → Redirect to login
- **403 Forbidden** → Redirect to appropriate dashboard
- **Token Expired** → Clear data and redirect to login

### 2. Role Mismatch
- **Wrong Role Access** → Redirect to correct dashboard
- **Unknown Role** → Redirect to homepage
- **Missing Role** → Redirect to login

### 3. Data Corruption
- **Invalid JSON** → Clear localStorage and redirect
- **Missing Data** → Redirect to login
- **Network Errors** → Show error messages

## Next Steps

### 1. Add More Protected Routes
```jsx
<Route 
  path="/admin/users" 
  element={
    <ProtectedRoute role="admin">
      <AdminUsers />
    </ProtectedRoute>
  } 
/>
```

### 2. Add Role-Based Navigation
```jsx
const { role } = useAuth();

{role === 'admin' && <AdminNav />}
{role === 'customer' && <CustomerNav />}
```

### 3. Add Route Guards
```jsx
const { hasRole } = useAuth();

if (!hasRole('admin')) {
  return <Navigate to="/unauthorized" />;
}
```

This system provides a robust, secure, and user-friendly role-based authentication experience!

