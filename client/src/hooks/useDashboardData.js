import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const response = await api.get(`/admin/dashboard?t=${Date.now()}`);

        console.log('Dashboard API Response:', response.data); // Debug logging
        if (response.data && typeof response.data === 'object') {
          setDashboardData(response.data);
        } else {
          setDashboardData(null);
        }
      } catch (err) {
        console.error('Dashboard API Error:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please login again.');
        } else if (err.response?.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError(err.response?.data?.message || err.message || 'Server error');
        }
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { dashboardData, loading, error };
}

export function useDetailedData() {
  const [detailedData, setDetailedData] = useState({
    users: [],
    products: [],
    orders: []
  });
  const [detailedLoading, setDetailedLoading] = useState(true);

  // Fetch user data on component mount to calculate customer stats
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setDetailedLoading(true);

        const response = await api.get('/admin/users');
        const data = response.data;
        
        setDetailedData(prev => ({
          ...prev,
          users: data.users || []
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setDetailedLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch product data on component mount to display product overview
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await api.get('/products?limit=50');
        const data = response.data;
        
        console.log('Product API Response:', data); // Debug logging
        console.log('Products in response:', data.products?.length || 0); // Debug logging
        
        setDetailedData(prev => ({
          ...prev,
          products: data.products || []
        }));
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchProductData();
  }, []);

  // Fetch detailed data for modals
  const fetchDetailedData = async (type) => {
    try {
      let url = `/${type}`;
      
      // Handle different API endpoints
      if (type === 'products') {
        url = '/products?limit=50';
      } else if (type === 'users') {
        url = '/admin/users';
      } else if (type === 'orders') {
        url = '/orders';
      }
      
      console.log(`Fetching ${type} data from:`, url); // Debug logging
      
      const response = await api.get(url);
      const data = response.data;
      
      console.log(`${type} API Response:`, data); // Debug logging
      
      setDetailedData(prev => ({
        ...prev,
        [type]: type === 'users' ? (data.users || []) : 
                type === 'products' ? (data.products || []) :
                type === 'orders' ? (data.orders || data || []) : data
      }));
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
    }
  };

  return { detailedData, detailedLoading, fetchDetailedData };
}

export function useModalState() {
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  const handleCardClick = (type, fetchDetailedData) => {
    fetchDetailedData(type);
    if (type === 'users') setShowUsersModal(true);
    if (type === 'products') setShowProductsModal(true);
    if (type === 'orders') setShowOrdersModal(true);
  };

  return {
    showUsersModal,
    setShowUsersModal,
    showProductsModal,
    setShowProductsModal,
    showOrdersModal,
    setShowOrdersModal,
    handleCardClick
  };
}

