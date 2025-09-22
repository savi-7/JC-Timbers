import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

export default function UsersModal({ showUsersModal, setShowUsersModal, detailedData, safeStats }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    if (showUsersModal) {
      fetchUsers();
    }
  }, [showUsersModal]);

  const testConnection = async () => {
    try {
      console.log('Testing connection to backend...');
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      const response = await fetch('http://localhost:5001/api/health', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Health check response:', response.status);
      const data = await response.json();
      console.log('Health check data:', data);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from API...'); // Debug logging
      
      // Use fetch instead of axios to ensure fresh data
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/users?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Users API Response:', data); // Debug logging
      setUsers(data.users || []);
      console.log('Users set to state:', data.users || []); // Debug logging
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.message);
      // Fallback to detailedData if API fails
      if (detailedData && detailedData.users) {
        console.log('Using fallback detailedData:', detailedData.users);
        setUsers(detailedData.users.filter(user => user.role === 'customer'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}/orders`);
      setUserOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      setUserOrders([]);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowUserProfile(true);
    fetchUserOrders(user._id);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.status === 'active') ||
                         (statusFilter === 'inactive' && user.status === 'inactive');
    return matchesSearch && matchesStatus && user.role === 'customer';
  });

  // Debug logging
  console.log('UsersModal Debug:', {
    users,
    filteredUsers,
    searchTerm,
    statusFilter,
    loading
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!showUsersModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600">Manage customer accounts and view their activity</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={testConnection}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150"
            >
              Test Connection
            </button>
            <button 
              onClick={fetchUsers}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
            >
              Refresh
            </button>
            <button 
              onClick={() => setShowUsersModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800">Total Customers</h3>
              <p className="text-2xl font-semibold text-blue-900">
                {users.filter(user => user.role === 'customer').length}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-sm font-medium text-green-800">Active Users</h3>
              <p className="text-2xl font-semibold text-green-900">
                {users.filter(user => user.role === 'customer' && user.status === 'active').length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800">Inactive Users</h3>
              <p className="text-2xl font-semibold text-yellow-900">
                {users.filter(user => user.role === 'customer' && user.status === 'inactive').length}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="text-sm font-medium text-purple-800">New This Month</h3>
              <p className="text-2xl font-semibold text-purple-900">
                {users.filter(user => {
                  const userDate = new Date(user.createdAt);
                  const currentDate = new Date();
                  return user.role === 'customer' && 
                         userDate.getMonth() === currentDate.getMonth() && 
                         userDate.getFullYear() === currentDate.getFullYear();
                }).length}
              </p>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer List ({filteredUsers.length} users)
              </h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user._id.slice(-8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewProfile(user)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user._id, user.status)}
                              className={`font-medium ${
                                user.status === 'active'
                                  ? 'text-red-600 hover:text-red-900'
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No customers have registered yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {showUserProfile && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-heading text-dark-brown">User Profile</h2>
                  <p className="text-gray-600 font-paragraph">Detailed information and order history</p>
                </div>
                <button
                  onClick={() => setShowUserProfile(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-heading text-dark-brown mb-4">Basic Information</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xl font-medium text-blue-600">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-heading text-dark-brown">{selectedUser.name}</h4>
                        <p className="text-gray-600">{selectedUser.email}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                          selectedUser.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedUser.status || 'active'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Phone:</span>
                        <span className="text-gray-600">{selectedUser.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Address:</span>
                        <span className="text-gray-600">{selectedUser.address || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Account Created:</span>
                        <span className="text-gray-600">{formatDate(selectedUser.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Last Login:</span>
                        <span className="text-gray-600">
                          {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => toggleUserStatus(selectedUser._id, selectedUser.status)}
                        className={`w-full py-2 px-4 rounded-lg font-paragraph transition-colors duration-200 ${
                          selectedUser.status === 'active'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {selectedUser.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Order History */}
                <div>
                  <h3 className="text-lg font-heading text-dark-brown mb-4">Order History</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    {userOrders.length > 0 ? (
                      <div className="space-y-4">
                        {userOrders.map((order, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">Order #{order._id.slice(-8)}</h4>
                              <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Items:</span>
                                <span className="font-medium">{order.items.length}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-medium">{formatINR(order.total)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Status:</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">No Orders Yet</h4>
                        <p className="text-sm text-gray-500">This customer hasn't made any purchases.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

