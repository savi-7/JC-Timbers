import jwt from "jsonwebtoken";

// JWT Authentication Middleware
export const authenticateToken = (req, res, next) => {
  // Try multiple header formats
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Log for service enquiry routes
  if (req.path && req.path.includes('enquiries')) {
    console.log('🔐 Auth middleware for /enquiries:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      path: req.path,
      method: req.method,
      url: req.url,
      authHeaderPreview: authHeader ? authHeader.substring(0, 50) + '...' : 'none'
    });
  }

  if (!token) {
    if (req.path && req.path.includes('enquiries')) {
      console.error('❌ No token provided for /enquiries');
      console.error('All headers:', Object.keys(req.headers));
      console.error('Authorization header value:', req.headers['authorization'] || req.headers['Authorization'] || 'NOT FOUND');
    }
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-jc-timbers-2024';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Map 'id' to 'userId' for consistency (token uses 'id', but code expects 'userId')
    req.user = {
      ...decoded,
      userId: decoded.id || decoded.userId, // Support both 'id' and 'userId'
      id: decoded.id || decoded.userId // Keep 'id' as well for compatibility
    };
    
    if (req.path && req.path.includes('enquiries')) {
      console.log('✅ Token verified successfully:', { 
        userId: req.user.userId, 
        id: req.user.id,
        role: req.user.role,
        decoded: decoded
      });
    }
    
    // Double check it's set
    if (!req.user || !req.user.userId) {
      console.error('❌ CRITICAL: req.user not set after jwt.verify!');
      console.error('Decoded token:', decoded);
      return res.status(401).json({ message: 'Authentication failed' });
    }
    
    next();
  } catch (err) {
    if (req.path && req.path.includes('enquiries')) {
      console.error('❌ Token verification failed:', err.message);
      console.error('Token error details:', {
        name: err.name,
        message: err.message,
        expiredAt: err.expiredAt
      });
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
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