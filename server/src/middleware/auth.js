import jwt from "jsonwebtoken";

// JWT Authentication Middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based Authorization Middleware
export const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    // First authenticate the token
    authenticateToken(req, res, () => {
      // Check if user has the required role
      if (req.user.role !== requiredRole) {
        return res.status(403).json({ 
          message: `Access denied. ${requiredRole} role required.`,
          userRole: req.user.role,
          requiredRole: requiredRole
        });
      }
      next();
    });
  };
};

// Admin-only middleware
export const requireAdmin = authorizeRole('admin');
export const authorizeAdmin = authorizeRole('admin');

// Customer-only middleware  
export const requireCustomer = authorizeRole('customer');

// Multiple roles middleware
export const authorizeRoles = (roles) => {
  return (req, res, next) => {
    authenticateToken(req, res, () => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: `Access denied. Required roles: ${roles.join(', ')}`,
          userRole: req.user.role,
          requiredRoles: roles
        });
      }
      next();
    });
  };
};