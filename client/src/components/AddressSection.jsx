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
    pincode: '',
    state: '',
    addressLine: '',
    flatHouseCompany: '',
    city: '',
    landmark: '',
    addressType: 'Home'
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
          pincode: addressData.pincode || addressData.zip || '',
          state: addressData.state || '',
          addressLine: addressData.addressLine || addressData.address || '',
          flatHouseCompany: addressData.flatHouseCompany || '',
          city: addressData.city || '',
          landmark: addressData.landmark || '',
          addressType: addressData.addressType || 'Home'
        };
        
        setFormData(userAddress);
        setAddress(userAddress);
        
        // If user has valid address, mark as complete
        if (userAddress.addressLine && userAddress.flatHouseCompany && userAddress.city && userAddress.state && userAddress.pincode) {
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
    // Validate all required fields
    if (!formData.name || !formData.phone || !formData.pincode || !formData.state || 
        !formData.addressLine || !formData.flatHouseCompany || !formData.city) {
      showError('Please fill in all required fields');
      return;
    }

    // Full name validation
    if (formData.name.trim().length < 3) {
      showError('Full name must be at least 3 characters');
      return;
    }

    // Phone validation
    if (!/^\d{10}$/.test(formData.phone)) {
      showError('Mobile number must be exactly 10 digits');
      return;
    }

    // Pincode validation
    if (!/^\d{6}$/.test(formData.pincode)) {
      showError('Pincode must be exactly 6 digits');
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
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">{address.name}</p>
              <span className="px-2 py-1 text-xs font-medium text-white bg-dark-brown rounded">
                {address.addressType || 'Home'}
              </span>
            </div>
            <p className="text-gray-700">{address.flatHouseCompany}</p>
            <p className="text-gray-700">{address.addressLine}</p>
            {address.landmark && (
              <p className="text-gray-600 text-sm">Landmark: {address.landmark}</p>
            )}
            <p className="text-gray-700">
              {address.city}, {address.state} - {address.pincode || address.zip}
            </p>
            <p className="text-gray-700 font-medium">Mobile: {address.phone}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Row 1: Full Name and Mobile Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                placeholder="10-digit mobile number"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number</p>
            </div>
          </div>

          {/* Row 2: Pincode and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                placeholder="6-digit pincode"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                placeholder="Enter state"
                required
              />
            </div>
          </div>

          {/* Row 3: Address (Area, Street, etc.) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address (Area, Street, Sector, Village) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
              placeholder="Area, Street, Sector, Village"
              required
            />
          </div>

          {/* Row 4: Flat/House/Company Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flat / House No. / Building / Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="flatHouseCompany"
              value={formData.flatHouseCompany}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
              placeholder="Flat No., House No., Building Name, Company Name"
              required
            />
          </div>

          {/* Row 5: City/Town and Landmark */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City / Town <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                placeholder="Enter city or town"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landmark <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                placeholder="Nearby landmark"
              />
            </div>
          </div>

          {/* Row 6: Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="Home"
                  checked={formData.addressType === 'Home'}
                  onChange={handleChange}
                  className="mr-2 w-4 h-4 text-dark-brown focus:ring-dark-brown"
                />
                <span className="text-gray-700">Home</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="Office"
                  checked={formData.addressType === 'Office'}
                  onChange={handleChange}
                  className="mr-2 w-4 h-4 text-dark-brown focus:ring-dark-brown"
                />
                <span className="text-gray-700">Office</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="Other"
                  checked={formData.addressType === 'Other'}
                  onChange={handleChange}
                  className="mr-2 w-4 h-4 text-dark-brown focus:ring-dark-brown"
                />
                <span className="text-gray-700">Other</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {!loading && address.addressLine && (
              <button
                onClick={() => {
                  setFormData(address);
                  setIsEditing(false);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-dark-brown text-white rounded-lg hover:bg-accent-red font-medium transition-colors"
            >
              Save & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

