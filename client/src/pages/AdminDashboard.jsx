import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [detailedData, setDetailedData] = useState({
    users: [],
    products: [],
    orders: []
  });

  // Fetch user data on component mount to calculate customer stats
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5001/api/users', {
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
            users: data
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
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
          setDetailedData(prev => ({
            ...prev,
            products: data.products || data
          }));
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchProductData();
  }, []);

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const response = await fetch('http://localhost:5001/api/admin/overview', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch detailed data for modals
  const fetchDetailedData = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/${type}`, {
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
          [type]: data
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
    }
  };

  const handleCardClick = (type) => {
    fetchDetailedData(type)
    if (type === 'users') setShowUsersModal(true);
    if (type === 'products') setShowProductsModal(true);
    if (type === 'orders') setShowOrdersModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <div className="w-4 h-4 bg-green-500 rounded-full"></div>;
      case 'warning':
        return <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>;
      case 'info':
        return <div className="w-4 h-4 bg-blue-500 rounded-full"></div>;
      default:
        return <div className="w-4 h-4 bg-gray-500 rounded-full"></div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mt-8 mb-4">Loading Dashboard</h2>
          <p className="text-gray-600 text-lg">Please wait while we fetch your data...</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-6">Error Loading Dashboard</h2>
          <p className="text-gray-600 text-lg mb-8">{error}</p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Retry
            </button>
            <div className="text-sm text-gray-500 bg-white/50 rounded-lg p-4">
              <p className="font-medium mb-2">If the problem persists, please check:</p>
              <ul className="text-left space-y-1">
                <li>• Server is running on port 5001</li>
                <li>• You are logged in as an admin</li>
                <li>• Database connection is working</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData || {};

  // Calculate customer-only stats (excluding admin users)
  const calculateCustomerStats = () => {
    if (!detailedData.users || detailedData.users.length === 0) {
      return {
        totalCustomers: typeof stats?.totalUsers === 'number' ? stats.totalUsers : 0,
        newCustomers: typeof stats?.newUsers === 'number' ? stats.newUsers : 0
      };
    }
    
    const customers = detailedData.users.filter(user => user.role === 'customer');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const newCustomersThisMonth = customers.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    }).length;
    
    return {
      totalCustomers: customers.length,
      newCustomers: newCustomersThisMonth
    };
  };

  const customerStats = calculateCustomerStats();

  // Safety check to ensure stats is always a flat object
  const safeStats = {
    totalUsers: customerStats.totalCustomers, // Now shows only customers
    totalProducts: typeof stats?.totalProducts === 'number' ? stats.totalProducts : 0,
    totalOrders: typeof stats?.totalOrders === 'number' ? stats.totalOrders : 0,
    pendingOrders: typeof stats?.pendingOrders === 'number' ? stats.pendingOrders : 0,
    lowStockItems: typeof stats?.lowStockItems === 'number' ? stats.lowStockItems : 0,
    activeUsers: typeof stats?.activeUsers === 'number' ? stats.activeUsers : 0,
    newUsers: customerStats.newCustomers // Now shows only new customers
  };

  // Helper to format currency in INR
  const formatINR = (amount) => {
    if (typeof amount !== 'number') return '₹0';
    return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/20 flex-shrink-0 transition-all duration-300 overflow-hidden lg:w-72 fixed lg:relative z-50 lg:z-auto h-full`}>
        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Timber Admin</h1>
              <p className="text-sm text-white/80 mt-1">Management Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="p-6 space-y-6 bg-white/50">
          {/* Dashboard Overview */}
          <div className="space-y-3">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100/50 rounded-lg">
              Main
            </div>
            <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 group bg-blue-50/50 border border-blue-200/50">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </div>
              Dashboard Overview
            </button>
          </div>

          {/* Management Actions */}
          <div className="space-y-3">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100/50 rounded-lg">
              Management
            </div>
            <button 
              onClick={() => navigate('/admin/vendors')}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:text-emerald-700 transition-all duration-200 group bg-emerald-50/30 border border-emerald-200/30"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              Vendor Management
            </button>
            <button 
              onClick={() => navigate('/admin/stock')}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-700 transition-all duration-200 group bg-orange-50/30 border border-orange-200/30"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              Stock Management
            </button>
            <button 
              onClick={() => navigate('/admin/products')}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:text-purple-700 transition-all duration-200 group bg-purple-50/30 border border-purple-200/30"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              Product Management
            </button>
          </div>

          {/* Coming Soon Actions */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Coming Soon
            </div>
            <div className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-500 rounded-lg cursor-not-allowed">
              <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              Analytics & Reports
              <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">Soon</span>
            </div>
            <div className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-500 rounded-lg cursor-not-allowed">
              <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">U</span>
              </div>
              User Management
              <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">Soon</span>
            </div>
            <div className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-500 rounded-lg cursor-not-allowed">
              <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              Support & Communication
              <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">Soon</span>
            </div>
          </div>

          {/* System Actions */}
          <div className="space-y-1 mt-8">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              System
            </div>
            <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">
              <div className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">⚙</span>
              </div>
              Settings
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
            >
              <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">↪</span>
              </div>
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/20 relative z-[9997]">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                {/* Mobile menu button */}
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all duration-200"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">Dashboard Overview</h1>
                  <div className="flex items-center space-x-3 mt-2">
                    <p className="text-gray-600 text-lg">Welcome back, <span className="font-semibold text-gray-800">{user?.name}</span> 👋</p>
                    {dashboardData && !error ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Live Data
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200 shadow-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        No Data
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                {/* Quick Stats */}
                <div className="hidden md:flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">System Online</span>
                  </div>
                  <div className="text-gray-400">|</div>
                  <div className="text-gray-600">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                
                {/* Profile Dropdown */}
                <div className="relative profile-dropdown z-[9998]">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-2 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{user?.name}</div>
                      <div className="text-xs text-gray-500">Administrator</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-[9999] border border-gray-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mt-2">
                          Admin Access
                        </span>
                      </div>
                      <div className="py-1">
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                          Profile Settings
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                          Account Settings
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            handleLogout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            <div 
              onClick={() => handleCardClick('users')}
              className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-2xl hover:border-blue-300/50 hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Customers</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{safeStats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleCardClick('products')}
              className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-2xl hover:border-emerald-300/50 hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-gradient-to-br hover:from-emerald-50/50 hover:to-green-50/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Products</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-800 bg-clip-text text-transparent mb-2">{safeStats.totalProducts}</p>
                  <p className="text-sm text-orange-600 font-medium">{safeStats.lowStockItems} low stock</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleCardClick('orders')}
              className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-2xl hover:border-purple-300/50 hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-violet-50/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Orders</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-800 bg-clip-text text-transparent mb-2">{safeStats.totalOrders}</p>
                  <p className="text-sm text-blue-600 font-medium">{safeStats.pendingOrders} pending</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-100 to-violet-200 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                  <p className="text-gray-600 mt-1">Manage your business operations</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Actions */}
                    <button 
                      onClick={() => navigate('/admin/vendors')}
                      className="group p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">V</span>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Vendor Management</h3>
                      <p className="text-sm text-gray-600">Manage vendors and wood intake</p>
                    </button>

                    <button 
                      onClick={() => navigate('/admin/stock')}
                      className="group p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
                          <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">S</span>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Stock Management</h3>
                      <p className="text-sm text-gray-600">Manage inventory and stock levels</p>
                    </button>

                    <button 
                      onClick={() => navigate('/admin/products')}
                      className="group p-6 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                          <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">P</span>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Product Management</h3>
                      <p className="text-sm text-gray-600">Manage products with images and attributes</p>
                    </button>

                    {/* New Actions - Coming Soon */}
                    <div className="group p-6 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gray-200 rounded-lg">
                          <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">A</span>
                          </div>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">Coming Soon</span>
                      </div>
                      <h3 className="font-semibold text-gray-700 mb-2">Overview & Analytics</h3>
                      <p className="text-sm text-gray-500">Detailed business insights and reports</p>
                    </div>

                    <button 
                      onClick={() => navigate('/admin/users')}
                      className="group p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">U</span>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
                      <p className="text-sm text-gray-600">View customers, carts, and orders</p>
                    </button>

                    <div className="group p-6 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gray-200 rounded-lg">
                          <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">C</span>
                          </div>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">Coming Soon</span>
                      </div>
                      <h3 className="font-semibold text-gray-700 mb-2">Support & Communication</h3>
                      <p className="text-sm text-gray-500">Customer support and messaging system</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                  <p className="text-gray-600 mt-1">Latest system updates</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Recent activity will be loaded from API */}
                    <div className="text-center text-gray-400 text-sm py-8">
                      No recent activity to display.
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium" disabled>
                      View All Activity →
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Alerts */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Quick Alerts</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Low Stock Alert</p>
                        <p className="text-xs text-yellow-600">{safeStats.lowStockItems} items need restocking</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Pending Orders</p>
                        <p className="text-xs text-blue-600">{safeStats.pendingOrders} orders awaiting processing</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-green-800">System Status</p>
                        <p className="text-xs text-green-600">All systems operational</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Overview Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Customers Overview</h2>
              <button 
                onClick={() => setShowUsersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800">Total Customers</h3>
                  <p className="text-2xl font-bold text-blue-900">
                    {detailedData.users.filter(user => user.role === 'customer').length}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800">New Customers This Month</h3>
                  <p className="text-2xl font-bold text-green-900">
                    {detailedData.users.filter(user => {
                      const userDate = new Date(user.createdAt);
                      const currentDate = new Date();
                      const currentMonth = currentDate.getMonth();
                      const currentYear = currentDate.getFullYear();
                      return user.role === 'customer' && 
                             userDate.getMonth() === currentMonth && 
                             userDate.getFullYear() === currentYear;
                    }).length}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
                <div className="space-y-3">
                  {detailedData.users.filter(user => user.role === 'customer').length > 0 ? (
                    detailedData.users.filter(user => user.role === 'customer').map((user, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{user.name}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No customers found or loading...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Overview Modal */}
      {showProductsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Products Overview</h2>
              <button 
                onClick={() => setShowProductsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800">Total Products</h3>
                  <p className="text-2xl font-bold text-green-900">{safeStats.totalProducts}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800">Low Stock Items</h3>
                  <p className="text-2xl font-bold text-yellow-900">{safeStats.lowStockItems}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800">Active Products</h3>
                  <p className="text-2xl font-bold text-blue-900">{safeStats.totalProducts}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="space-y-3">
                  {detailedData.products.length > 0 ? (
                    detailedData.products.map((product, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start space-x-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img 
                                  src={product.images[0].url || `data:${product.images[0].contentType || 'image/jpeg'};base64,${product.images[0].data}`}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/64x64/f3f4f6/9ca3af?text=No+Image';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-lg">{product.name}</h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                                
                                <div className="flex items-center space-x-4 mt-3">
                                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                    product.category === 'timber' 
                                      ? 'bg-green-100 text-green-800'
                                      : product.category === 'furniture'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
                                  </span>
                                  
                                  <span className="text-lg font-bold text-gray-900">
                                    {formatINR(product.price)}
                                  </span>
                                  
                                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                                    product.quantity < 50 
                                      ? 'bg-orange-100 text-orange-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {product.quantity < 50 ? 'Limited Stock' : 'In Stock'}
                                  </span>
                                </div>
                                
                                {/* Product Attributes */}
                                {product.attributes && Object.keys(product.attributes).length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-2">
                                      {Object.entries(product.attributes).slice(0, 3).map(([key, value]) => (
                                        <span key={key} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          {key}: {value}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-right text-sm text-gray-500 ml-4">
                                <p className="font-medium">Stock: {product.quantity} {product.unit}</p>
                                <p className="text-xs mt-1">
                                  Created: {new Date(product.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">Products will appear here once they are added to the database.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Overview Modal */}
      {showOrdersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Products Overview</h2>
              <button 
                onClick={() => setShowOrdersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800">Total Products</h3>
                  <p className="text-2xl font-bold text-green-900">{safeStats.totalProducts}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800">Low Stock Items</h3>
                  <p className="text-2xl font-bold text-yellow-900">{safeStats.lowStockItems}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800">Active Products</h3>
                  <p className="text-2xl font-bold text-blue-900">{safeStats.totalProducts}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="space-y-3">
                  {detailedData.products.length > 0 ? (
                    detailedData.products.map((product, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600">{product.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                product.category === 'timber' 
                                  ? 'bg-green-100 text-green-800'
                                  : product.category === 'furniture'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {product.category}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {formatINR(product.price)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>Stock: {product.quantity} {product.unit}</p>
                            <p className={`${product.quantity < 50 ? 'text-red-600' : 'text-green-600'}`}>
                              {product.quantity < 50 ? 'Limited Stock' : 'In Stock'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Loading product data...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}