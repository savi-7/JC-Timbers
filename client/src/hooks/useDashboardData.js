import { useState, useEffect } from 'react';

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

        const response = await fetch(`http://localhost:5001/api/admin/dashboard?t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          } else if (response.status === 403) {
            throw new Error('Access denied. Admin privileges required.');
          } else {
            throw new Error(errorData.message || `Server error: ${response.status}`);
          }
        }

        const data = await response.json();
        console.log('Dashboard API Response:', data); // Debug logging
        if (data && typeof data === 'object') {
          setDashboardData(data);
        } else {
          setDashboardData(null);
        }
      } catch (err) {
        setError(err.message);
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
        const token = localStorage.getItem('token');
        if (!token) {
          setDetailedLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5001/api/admin/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDetailedData(prev => ({
            ...prev,
            users: data.users || []
          }));
        }
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
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5001/api/products?limit=50', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Product API Response:', data); // Debug logging
          console.log('Products in response:', data.products?.length || 0); // Debug logging
          setDetailedData(prev => ({
            ...prev,
            products: data.products || []
          }));
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchProductData();
  }, []);

  // Fetch detailed data for modals
  const fetchDetailedData = async (type) => {
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:5001/api/${type}`;
      
      // Handle different API endpoints
      if (type === 'products') {
        url = 'http://localhost:5001/api/products?limit=50';
      } else if (type === 'users') {
        url = 'http://localhost:5001/api/admin/users';
      } else if (type === 'orders') {
        url = 'http://localhost:5001/api/orders';
      }
      
      console.log(`Fetching ${type} data from:`, url); // Debug logging
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`${type} API Response:`, data); // Debug logging
        
        setDetailedData(prev => ({
          ...prev,
          [type]: type === 'users' ? (data.users || []) : 
                  type === 'products' ? (data.products || []) :
                  type === 'orders' ? (data.orders || data || []) : data
        }));
      } else {
        console.error(`Failed to fetch ${type} data:`, response.status, response.statusText);
      }
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

