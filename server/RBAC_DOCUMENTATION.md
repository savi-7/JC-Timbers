# Role-Based Access Control (RBAC) Documentation

## Overview
This Node.js Express application now supports role-based access control with two user roles: `admin` and `customer`.

## User Schema
The User model includes a `role` field with the following configuration:
```javascript
role: { 
  type: String, 
  enum: ['admin', 'customer'], 
  default: 'customer',
  required: true
}
```

## Registration
Users can register with an optional role parameter. If no role is provided, it defaults to 'customer'.

### Example Registration Requests:

**Customer Registration (default):**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "phone": "1234567890"
}
```

**Admin Registration:**
```json
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

## Authentication
The login API returns a JWT token that includes the user's role in the payload.

### Login Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "phone": "1234567890",
    "role": "admin"
  }
}
```

## Middleware Functions

### 1. `authenticateToken`
Verifies JWT token and adds user info to `req.user`.

### 2. `authorizeRole(requiredRole)`
Checks if the authenticated user has the required role.

### 3. `requireAdmin`
Convenience middleware for admin-only routes.

### 4. `requireCustomer`
Convenience middleware for customer-only routes.

### 5. `authorizeRoles(roles)`
Allows access for multiple roles.

## Protected Routes

### Admin-Only Routes:
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - List all users
- `GET /api/admin/reports` - Admin reports

### Customer-Only Routes:
- `GET /api/customer/profile` - Customer profile
- `GET /api/customer/orders` - Customer orders

### Shared Routes:
- `GET /api/shared/settings` - Accessible to both admin and customer

## Usage Examples

### Protecting a Route for Admin Only:
```javascript
import { requireAdmin } from '../middleware/auth.js';

router.get('/admin/dashboard', requireAdmin, (req, res) => {
  res.json({ message: 'Admin dashboard', user: req.user });
});
```

### Protecting a Route for Customer Only:
```javascript
import { requireCustomer } from '../middleware/auth.js';

router.get('/customer/profile', requireCustomer, (req, res) => {
  res.json({ message: 'Customer profile', user: req.user });
});
```

### Protecting a Route for Multiple Roles:
```javascript
import { authorizeRoles } from '../middleware/auth.js';

router.get('/shared/settings', authorizeRoles(['admin', 'customer']), (req, res) => {
  res.json({ message: 'Settings', user: req.user });
});
```

### Using authorizeRole Directly:
```javascript
import { authorizeRole } from '../middleware/auth.js';

router.get('/admin/reports', authorizeRole('admin'), (req, res) => {
  res.json({ message: 'Admin reports', user: req.user });
});
```

## Error Responses

### 401 Unauthorized (No Token):
```json
{
  "message": "Access token required"
}
```

### 403 Forbidden (Invalid Token):
```json
{
  "message": "Invalid or expired token"
}
```

### 403 Forbidden (Wrong Role):
```json
{
  "message": "Access denied. admin role required.",
  "userRole": "customer",
  "requiredRole": "admin"
}
```

## Testing

Run the test script to verify the role-based authentication:
```bash
node test-role-based-auth.js
```

This will test:
- User registration with different roles
- Login and token generation
- Access to role-specific routes
- Proper blocking of unauthorized access

## Security Notes

1. **JWT Secret**: Ensure `JWT_SECRET` is set in your environment variables
2. **Token Expiration**: Tokens expire after 1 hour
3. **Role Validation**: Roles are validated both at registration and in middleware
4. **Default Role**: Users default to 'customer' role if not specified
5. **Enum Validation**: Only 'admin' and 'customer' roles are allowed

