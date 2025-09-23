import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { useNotification } from '../components/NotificationProvider';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('CustomerProfile useEffect - isAuthenticated:', isAuthenticated, 'user:', user);
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/customer-home')}
                className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-heading text-dark-brown">My Profile</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/customer-home')}
                className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                className="bg-accent-red text-white px-4 py-2 rounded-lg font-paragraph hover:bg-red-600 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-dark-brown to-accent-red rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-2xl">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-heading text-dark-brown mb-2">{user?.name}</h2>
              <p className="text-gray-600 font-paragraph">{user?.email}</p>
              <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 mt-2">
                Customer
              </span>
            </div>
          </div>
        </div>

        {/* Profile Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login & Security */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-brown">Login & Security</h3>
                <p className="text-sm text-gray-600">Manage your account settings</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Update your personal information, email, mobile number, and password settings.
            </p>
            <button
              onClick={() => navigate('/login-security')}
              className="w-full bg-dark-brown text-white py-3 px-4 rounded-lg font-paragraph hover:bg-accent-red transition-colors duration-200"
            >
              Manage Login & Security
            </button>
          </div>

          {/* Address Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-brown">Address Management</h3>
                <p className="text-sm text-gray-600">Manage your delivery addresses</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Add, edit, or remove your delivery addresses. Set default address for quick checkout.
            </p>
            <button
              onClick={() => navigate('/addresses')}
              className="w-full bg-dark-brown text-white py-3 px-4 rounded-lg font-paragraph hover:bg-accent-red transition-colors duration-200"
            >
              Manage Addresses
            </button>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-brown">Order History</h3>
                <p className="text-sm text-gray-600">View your past orders</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Track your order history and view details of your past purchases.
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-dark-brown text-white py-3 px-4 rounded-lg font-paragraph hover:bg-accent-red transition-colors duration-200"
            >
              View Order History
            </button>
          </div>

          {/* Wishlist */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-brown">Wishlist</h3>
                <p className="text-sm text-gray-600">Your saved items</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              View and manage your saved items. Add items to cart or remove from wishlist.
            </p>
            <button
              onClick={() => navigate('/wishlist')}
              className="w-full bg-dark-brown text-white py-3 px-4 rounded-lg font-paragraph hover:bg-accent-red transition-colors duration-200"
            >
              View Wishlist
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
