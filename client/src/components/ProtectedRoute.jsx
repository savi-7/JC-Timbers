import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role, fallbackPath = '/login' }) => {
  // Get authentication data from localStorage
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const user = localStorage.getItem('user');

  console.log('ProtectedRoute - Required role:', role);
  console.log('ProtectedRoute - User role:', userRole);
  console.log('ProtectedRoute - Has token:', !!token);

  // Check if user is authenticated
  const isAuthenticated = () => {
    if (!token || !userRole || !user) {
      console.log('ProtectedRoute - Not authenticated: missing token/role/user');
      return false;
    }

    try {
      // Verify user data is valid JSON
      JSON.parse(user);
      console.log('ProtectedRoute - Authenticated successfully');
      return true;
    } catch (error) {
      // If user data is corrupted, clear it
      console.log('ProtectedRoute - Corrupted user data, clearing');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      return false;
    }
  };

  // Check if user has the required role
  const hasRequiredRole = () => {
    const hasRole = userRole === role;
    console.log('ProtectedRoute - Has required role?', hasRole, `(${userRole} === ${role})`);
    return hasRole;
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    console.log('ProtectedRoute - Redirecting to login');
    return <Navigate to={fallbackPath} replace />;
  }

  // If authenticated but wrong role, redirect to appropriate dashboard
  if (!hasRequiredRole()) {
    console.log('ProtectedRoute - Wrong role, redirecting...');
    if (userRole === 'admin') {
      console.log('ProtectedRoute - Redirecting to admin dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'customer') {
      console.log('ProtectedRoute - Redirecting to /');
      return <Navigate to="/" replace />;
    } else {
      console.log('ProtectedRoute - Unknown role, redirecting to /');
      return <Navigate to="/" replace />;
    }
  }

  console.log('ProtectedRoute - Access granted, rendering children');
  // If authenticated and has correct role, render children
  return children;
};

export default ProtectedRoute;
