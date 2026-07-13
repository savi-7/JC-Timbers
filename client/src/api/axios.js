import axios from 'axios';
import { API_BASE } from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Always set Authorization header - use direct assignment for reliability
      config.headers['Authorization'] = `Bearer ${token}`;
      
      // For FormData, don't set Content-Type - let browser/axios set it with boundary
      if (config.data instanceof FormData) {
        // Delete Content-Type so axios can set it with boundary
        delete config.headers['Content-Type'];
        // Re-set Authorization after deleting Content-Type to ensure it's still there
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Axios request with token:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        isFormData: config.data instanceof FormData,
        hasAuthHeader: !!config.headers['Authorization'],
        authHeaderValue: config.headers['Authorization'] ? config.headers['Authorization'].substring(0, 30) + '...' : 'MISSING'
      });
    } else {
      console.log('⚠️ Axios request without token:', {
        url: config.url,
        method: config.method
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Axios response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Handle authentication errors (401) and authorization errors (403) that indicate auth failure
    if (error.response?.status === 401) {
      // Token expired or invalid
      const errorMessage = error.response?.data?.message || 'Authentication failed';
      console.log('Token expired or invalid, clearing auth data:', errorMessage);
      
      // Only redirect if it's actually an auth error, not a validation error
      if (errorMessage.includes('token') || errorMessage.includes('authentication') || errorMessage.includes('Access token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

