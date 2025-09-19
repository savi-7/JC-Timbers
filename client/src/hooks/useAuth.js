import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const userRole = localStorage.getItem('role');

      console.log('useAuth checkAuthStatus - token:', !!token, 'userData:', !!userData, 'userRole:', userRole);

      if (token && userData && userRole) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setRole(userRole);
        setIsAuthenticated(true);
        console.log('useAuth - User authenticated:', parsedUser.name, 'role:', userRole);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
        console.log('useAuth - User not authenticated');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData, userRole) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
    
    setUser(userData);
    setRole(userRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const hasRole = (requiredRole) => {
    return role === requiredRole;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(role);
  };

  return {
    isAuthenticated,
    user,
    role,
    loading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    checkAuthStatus
  };
};
