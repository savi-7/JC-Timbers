import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role, fallbackPath = '/login' }) => {
  // Get authentication data from localStorage
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const user = localStorage.getItem('user');

  // Check if user is authenticated
  const isAuthenticated = () => {
    if (!token || !userRole || !user) {
      return false;
    }

    try {
      // Verify user data is valid JSON
      JSON.parse(user);
      return true;
    } catch (error) {
      // If user data is corrupted, clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      return false;
    }
  };

  // Check if user has the required role
  const hasRequiredRole = () => {
    return userRole === role;
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If authenticated but wrong role, redirect to appropriate dashboard
  if (!hasRequiredRole()) {
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'customer') {
      return <Navigate to="/shop" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated and has correct role, render children
  return children;
};

export default ProtectedRoute;
