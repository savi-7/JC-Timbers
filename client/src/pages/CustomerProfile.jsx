import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { useNotification } from '../components/NotificationProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    orders: [],
    wishlistCount: 0,
    enquiriesCount: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, wishlistRes, enquiriesRes] = await Promise.all([
        api.get('/orders/me').catch(() => ({ data: [] })),
        api.get('/wishlist').catch(() => ({ data: { items: [] } })),
        api.get('/enquiries/my').catch(() => ({ data: [] }))
      ]);

      setDashboardData({
        orders: ordersRes.data || [],
        wishlistCount: wishlistRes.data?.items?.length || 0,
        enquiriesCount: Array.isArray(enquiriesRes.data) ? enquiriesRes.data.length : (enquiriesRes.data?.enquiries?.length || 0)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    // If it's a base64 data URL, return as-is
    if (image.startsWith('data:')) return image;
    // If it's a full URL, return as-is
    if (image.startsWith('http')) return image;
    // If it's an uploads path, prepend the API URL
    if (image.startsWith('/uploads/')) return `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${image}`;
    // Default: assume it's a filename in uploads
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/uploads/${image}`;
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleLogout = () => {
    logout();
    // Navigation is handled by the logout function in useAuth hook
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-cream min-h-screen">
        {!isAuthenticated ? (
          /* Not Authenticated - Show Login Prompt */
          <div className="w-full bg-white p-12 text-center mt-8 mx-auto h-fit border border-gray-100 rounded-2xl shadow-sm max-w-2xl">
            <h2 className="text-3xl font-heading font-bold text-dark-brown mb-6 tracking-wide">Welcome to Your Profile</h2>
            <p className="text-gray-500 mb-8 font-paragraph leading-relaxed">
              Please log in to access your bespoke furniture preferences, manage addresses, and view ongoing orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-dark-brown text-white px-8 py-3 rounded-lg font-heading text-sm uppercase tracking-widest hover:bg-opacity-90 transition-all duration-300"
              >
                Login to Account
              </button>
              <button
                onClick={() => navigate('/register')}
                className="border border-dark-brown text-dark-brown px-8 py-3 rounded-lg font-heading text-sm uppercase tracking-widest hover:bg-gray-50 transition-all duration-300"
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated - Minimal Sidebar Dashboard */
          <div className="flex flex-col md:flex-row items-start gap-8 w-full">
            
            {/* LEFT SIDEBAR AREA */}
            <div className="w-full md:w-1/4 flex flex-col gap-6 md:sticky md:top-24">
              
              {/* Profile Overview Card */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-dark-brown to-accent-red rounded-full flex items-center justify-center text-white text-4xl font-heading mb-4 shadow-inner">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <h3 className="font-heading font-bold text-dark-brown text-xl mb-1">{user?.name}</h3>
                <p className="text-gray-500 text-sm font-paragraph mb-4">{user?.email}</p>
                <span className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-xs font-bold w-max mx-auto shadow-sm">
                  {user?.role === 'admin' ? 'Administrator' : 'Premium Member'}
                </span>
                <div className="w-full pt-6 mt-6 border-t border-gray-100 flex justify-between items-center text-sm font-paragraph">
                  <span className="text-gray-500">Member since</span>
                  <span className="font-semibold text-dark-brown">{new Date().getFullYear()}</span>
                </div>
              </div>

              {/* Navigation Menu Card */}
              <div className="bg-white rounded-2xl py-4 shadow-sm border border-gray-100 flex flex-col font-paragraph">
                
                {/* Overview Link */}
                <div className="px-4 py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-cream text-accent-red font-bold transition-all text-sm mb-1 border border-gray-100">
                    Overview
                  </button>
                </div>

                {/* Profile Accordion */}
                <div className="px-4 py-1">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)} 
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm mb-1 ${isProfileOpen ? 'text-dark-brown font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-dark-brown font-medium'}`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Profile Settings
                    </div>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  
                  {/* Expanded Profile Links */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isProfileOpen ? 'max-h-40 opacity-100 my-2' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col gap-1 pl-11 pr-2 border-l-2 border-gray-100 ml-6 py-1">
                      <button onClick={() => navigate('/login-security')} className="w-full text-left py-2 text-sm text-gray-500 hover:text-accent-red transition-colors font-medium relative group">
                        <span className="absolute -left-[18px] top-1/2 -mt-[1px] w-3 h-[2px] bg-gray-200 group-hover:bg-accent-red transition-colors"></span>
                        Login & Security
                      </button>
                      <button onClick={() => navigate('/addresses')} className="w-full text-left py-2 text-sm text-gray-500 hover:text-accent-red transition-colors font-medium relative group">
                        <span className="absolute -left-[18px] top-1/2 -mt-[1px] w-3 h-[2px] bg-gray-200 group-hover:bg-accent-red transition-colors"></span>
                        Address Management
                      </button>
                    </div>
                  </div>
                </div>

                {/* Other Navigation Links */}
                <div className="px-4 py-1">
                  <button onClick={() => navigate('/orders')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-dark-brown transition-all text-sm font-medium mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    My Orders
                  </button>
                </div>
                <div className="px-4 py-1">
                  <button onClick={() => navigate('/my-enquiries')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-dark-brown transition-all text-sm font-medium mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Custom Requests
                  </button>
                </div>
                <div className="px-4 py-1">
                  <button onClick={() => navigate('/wishlist')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-dark-brown transition-all text-sm font-medium mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Wishlist
                  </button>
                </div>
                
                {/* Logout */}
                <div className="px-4 py-1 mt-2 mb-2 border-t border-gray-100 pt-3">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-accent-red hover:bg-red-50 hover:text-red-700 transition-all text-sm font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT MAIN CONTENT AREA */}
            <div className="w-full md:w-3/4 flex flex-col gap-6">
              
              {/* Header Title Space */}
              <div className="mb-2">
                <h1 className="text-3xl font-heading font-bold text-dark-brown mb-1 tracking-tight">
                  Welcome back, {user?.name?.split(' ')[0] || 'Customer'}!
                </h1>
                <p className="text-gray-500 font-paragraph text-sm">
                  Here's what's happening with your account
                </p>
              </div>

              {/* Minimal Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Orders Card */}
                <div onClick={() => navigate('/orders')} className="bg-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow group">
                  <div className="flex flex-col gap-2">
                    <div className="text-[#DDBEA9] group-hover:text-dark-brown transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Total Orders</span>
                  </div>
                  <span className="text-3xl font-heading font-bold text-dark-brown group-hover:text-amber-700 transition-colors">{dashboardData.orders.length}</span>
                </div>

                {/* Wishlist Card */}
                <div onClick={() => navigate('/wishlist')} className="bg-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow group">
                  <div className="flex flex-col gap-2">
                    <div className="text-[#913F4A] opacity-70 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Wishlist Items</span>
                  </div>
                  <span className="text-3xl font-heading font-bold text-dark-brown group-hover:text-accent-red transition-colors">{dashboardData.wishlistCount}</span>
                </div>

                {/* Custom Requests Card */}
                <div onClick={() => navigate('/my-enquiries')} className="bg-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow group sm:col-span-2 lg:col-span-1">
                  <div className="flex flex-col gap-2">
                    <div className="text-[#DDBEA9] group-hover:text-dark-brown transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Custom Requests</span>
                  </div>
                  <span className="text-3xl font-heading font-bold text-dark-brown">{dashboardData.enquiriesCount}</span>
                </div>

              </div>

              {/* Minimal Recent Orders Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden mt-2">
                <h3 className="font-heading font-bold text-lg text-dark-brown mb-6">Recent Orders</h3>
                
                <div className="flex flex-col">
                  {dashboardData.orders.length > 0 ? (
                    dashboardData.orders.slice(0, 3).map((order, index) => (
                      <div key={order._id} onClick={() => navigate('/orders')} className={`group flex flex-col md:flex-row items-center justify-between py-4 ${index !== 0 ? 'border-t border-gray-50' : ''} cursor-pointer hover:bg-gray-50/50 transition-colors -mx-6 px-6`}>
                        
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            {order.items && order.items[0] && (order.items[0].image || order.items[0].product?.images?.[0] || order.items[0].product?.image) ? (
                              <img src={getImageUrl(order.items[0].image || order.items[0].product?.images?.[0] || order.items[0].product?.image)} alt="order item" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="font-heading font-bold text-dark-brown text-base hover:text-accent-red transition-colors">ORD-{order._id.slice(-8).toUpperCase()}</span>
                            <span className="text-xs text-gray-500 font-paragraph">{order.items?.length || 0} items • {formatINR(order.totalAmount)}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5 tracking-wide">Ordered March X, 2026 { /* Simulated text to match mockup visual flow */ }</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end shrink-0 pl-16 md:pl-0">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(order.status).replace('bg-', 'bg-opacity-10 text-opacity-100 border-opacity-10 text-').replace('text-', 'text-').replace('-100', '-600')}`}>
                            {order.status}
                          </span>
                          <svg className="w-4 h-4 text-gray-300 group-hover:text-dark-brown transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-gray-400 font-paragraph text-sm">
                      <p>You have no recent orders yet.</p>
                      <button onClick={() => navigate('/furniture')} className="font-bold text-[#DDBEA9] hover:text-dark-brown mt-2 transition-colors">Start Shopping</button>
                    </div>
                  )}

                  {dashboardData.orders.length > 0 && (
                    <div className="pt-6 border-t border-gray-50 mt-2 text-center">
                       <button onClick={() => navigate('/orders')} className="text-xs font-bold text-[#DDBEA9] hover:text-dark-brown uppercase tracking-widest transition-colors">
                         View All Orders
                       </button>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
