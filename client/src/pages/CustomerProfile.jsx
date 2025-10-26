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

  useEffect(() => {
    console.log('CustomerProfile useEffect - isAuthenticated:', isAuthenticated, 'user:', user);
    // No automatic redirect - let the user see the profile page
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    // Navigation is handled by the logout function in useAuth hook
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {!isAuthenticated ? (
          /* Not Authenticated - Show Login Prompt */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading text-dark-brown mb-4">Welcome to Your Profile</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access your profile settings, manage your addresses, and view your account information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-dark-brown text-white px-6 py-3 rounded-lg font-paragraph hover:bg-accent-red transition-colors duration-200"
              >
                Login to Your Account
              </button>
              <button
                onClick={() => navigate('/register')}
                className="border-2 border-dark-brown text-dark-brown px-6 py-3 rounded-lg font-paragraph hover:bg-dark-brown hover:text-white transition-colors duration-200"
              >
                Create New Account
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated - Show Profile Dashboard */
          <>
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
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
