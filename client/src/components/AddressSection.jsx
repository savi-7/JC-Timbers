import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNotification } from './NotificationProvider';

export default function AddressSection({ address, setAddress, onComplete }) {
  const { showSuccess, showError } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    zip: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      if (response.data.success && response.data.user.address) {
        // Parse address if it's a JSON string
        let addressData;
        try {
          addressData = typeof response.data.user.address === 'string' 
            ? JSON.parse(response.data.user.address) 
            : response.data.user.address;
        } catch {
          addressData = {};
        }
        
        const userAddress = {
          name: addressData.name || response.data.user.name || '',
          phone: addressData.phone || response.data.user.phone || '',
          addressLine: addressData.addressLine || addressData.address || '',
          city: addressData.city || '',
          state: addressData.state || '',
          zip: addressData.zip || ''
        };
        
        setFormData(userAddress);
        setAddress(userAddress);
        
        // If user has valid address, mark as complete
        if (userAddress.addressLine && userAddress.city && userAddress.state && userAddress.zip) {
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    // Validate all fields
    if (!formData.name || !formData.phone || !formData.addressLine || !formData.city || !formData.state || !formData.zip) {
      showError('Please fill in all address fields');
      return;
    }

    // Phone validation
    if (!/^\d{10}$/.test(formData.phone)) {
      showError('Please enter a valid 10-digit phone number');
      return;
    }

    // ZIP validation
    if (!/^\d{6}$/.test(formData.zip)) {
      showError('Please enter a valid 6-digit PIN code');
      return;
    }

    try {
      const response = await api.post('/auth/update-address', {
        address: JSON.stringify(formData)
      });
      
      if (response.data.success) {
        showSuccess('Address saved successfully');
        setAddress(formData);
        setIsEditing(false);
        onComplete && onComplete();
      }
    } catch (error) {
      console.error('Error saving address:', error);
      showError(error.response?.data?.message || 'Failed to save address');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-brown"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-dark-brown text-white rounded-full flex items-center justify-center font-semibold">
            1
          </div>
          <h2 className="text-xl font-bold text-dark-brown">Delivery Address</h2>
        </div>
        {!isEditing && address.addressLine && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Change
          </button>
        )}
      </div>

      {!isEditing && address.addressLine ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-2">
            <p className="font-semibold text-gray-900">{address.name}</p>
            <p className="text-gray-700">{address.addressLine}</p>
            <p className="text-gray-700">
              {address.city}, {address.state} - {address.zip}
            </p>
            <p className="text-gray-700">Phone: {address.phone}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
              placeholder="Flat, House no., Building, Company, Apartment"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                placeholder="Mumbai"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                placeholder="Maharashtra"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                maxLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                placeholder="400001"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            {!loading && address.address && (
              <button
                onClick={() => {
                  setFormData(address);
                  setIsEditing(false);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-dark-brown text-white rounded-lg hover:bg-accent-red font-medium transition-colors"
            >
              Save Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

