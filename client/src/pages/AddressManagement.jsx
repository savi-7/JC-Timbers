import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { useNotification } from '../components/NotificationProvider';

export default function AddressManagement() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    pincode: '',
    state: '',
    address: '',
    city: '',
    landmark: '',
    addressType: 'home',
    isDefault: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchAddresses();
    }
  }, [isAuthenticated, navigate]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/addresses');
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      showError('Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress._id}`, formData);
        showSuccess('Address updated successfully');
      } else {
        await api.post('/addresses', formData);
        showSuccess('Address added successfully');
      }
      
      setShowAddForm(false);
      setEditingAddress(null);
      setFormData({
        fullName: '',
        mobileNumber: '',
        pincode: '',
        state: '',
        address: '',
        city: '',
        landmark: '',
        addressType: 'home',
        isDefault: false
      });
      fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      showError(error.response?.data?.message || 'Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      mobileNumber: address.mobileNumber,
      pincode: address.pincode,
      state: address.state,
      address: address.address,
      city: address.city,
      landmark: address.landmark,
      addressType: address.addressType,
      isDefault: address.isDefault
    });
    setShowAddForm(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await api.delete(`/addresses/${addressId}`);
        showSuccess('Address deleted successfully');
        fetchAddresses();
      } catch (error) {
        console.error('Error deleting address:', error);
        showError('Failed to delete address');
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await api.patch(`/addresses/${addressId}/default`);
      showSuccess('Default address updated successfully');
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      showError('Failed to set default address');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    setFormData({
      fullName: '',
      mobileNumber: '',
      pincode: '',
      state: '',
      address: '',
      city: '',
      landmark: '',
      addressType: 'home',
      isDefault: false
    });
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
                onClick={() => navigate('/customer-profile')}
                className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-heading text-dark-brown">Address Management</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/customer-profile')}
                className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph"
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Add Address Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-dark-brown">Your Addresses</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-dark-brown text-white px-4 py-2 rounded-lg font-paragraph hover:bg-accent-red transition-colors duration-200"
          >
            Add New Address
          </button>
        </div>

        {/* Add/Edit Address Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-dark-brown mb-6">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200"
                    placeholder="Flat/House/Company address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City/Town</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200"
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                  <select
                    name="addressType"
                    value={formData.addressType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200"
                  >
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-dark-brown border-gray-300 rounded focus:ring-dark-brown"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">Set as default address</label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-paragraph hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-dark-brown text-white px-6 py-3 rounded-lg font-paragraph hover:bg-accent-red transition-colors duration-200"
                >
                  {editingAddress ? 'Update Address' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown"></div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses found</h3>
            <p className="text-gray-600 mb-6">Add your first address to get started with deliveries.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-dark-brown text-white px-6 py-3 rounded-lg font-paragraph hover:bg-accent-red transition-colors duration-200"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div key={address._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {address.addressType}
                    </span>
                    {address.isDefault && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-dark-brown hover:text-accent-red transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-dark-brown">{address.fullName}</h4>
                  <p className="text-gray-600">{address.mobileNumber}</p>
                  <p className="text-gray-600">
                    {address.address}, {address.city}, {address.state} - {address.pincode}
                  </p>
                  {address.landmark && (
                    <p className="text-sm text-gray-500">Near: {address.landmark}</p>
                  )}
                </div>
                
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-paragraph hover:bg-gray-200 transition-colors duration-200"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
