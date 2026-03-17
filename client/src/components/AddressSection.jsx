import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNotification } from './NotificationProvider';
import { getLocationFromPincode, validatePincode } from '../utils/pincodeLookup';

// Map Address model (from /addresses API) to checkout format
function addressToCheckout(addr) {
  if (!addr) return null;
  return {
    name: addr.fullName || addr.name || '',
    phone: addr.mobileNumber || addr.phone || '',
    pincode: addr.pincode || addr.zip || '',
    state: addr.state || '',
    addressLine: addr.address || addr.addressLine || '',
    flatHouseCompany: addr.flatHouseCompany || '',
    city: addr.city || '',
    landmark: addr.landmark || '',
    addressType: addr.addressType || 'Home',
    _id: addr._id
  };
}

// Map checkout form to Address API payload
function checkoutToAddressPayload(form) {
  return {
    fullName: form.name,
    mobileNumber: form.phone,
    pincode: form.pincode,
    state: form.state,
    address: form.addressLine,
    flatHouseCompany: form.flatHouseCompany,
    city: form.city,
    landmark: form.landmark || '',
    addressType: form.addressType || 'Home',
    isDefault: false
  };
}

export default function AddressSection({ address, setAddress, onComplete }) {
  const { showSuccess, showError } = useNotification();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
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
    fetchAddressesAndProfile();
  }, []);

  const fetchAddressesAndProfile = async () => {
    try {
      setLoading(true);
      const [addrRes, profileRes] = await Promise.all([
        api.get('/addresses'),
        api.get('/auth/profile').catch(() => ({ data: {} }))
      ]);

      const addresses = addrRes.data?.addresses || [];
      setSavedAddresses(addresses);

      if (addresses.length > 0) {
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        const checkoutAddr = addressToCheckout(defaultAddr);
        setSelectedAddressId(defaultAddr._id);
        setAddress(checkoutAddr);
        setFormData(checkoutAddr);
        setShowAddForm(false);
        setIsEditing(false);
      } else if (profileRes.data?.success && profileRes.data?.user?.address) {
        let addressData;
        try {
          const raw = profileRes.data.user.address;
          addressData = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch {
          addressData = {};
        }
        const userAddress = {
          name: addressData.name || profileRes.data.user.name || '',
          phone: addressData.phone || profileRes.data.user.phone || '',
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
        if (userAddress.addressLine && userAddress.flatHouseCompany && userAddress.city && userAddress.state && userAddress.pincode) {
          setIsEditing(false);
        } else {
          setShowAddForm(true);
          setIsEditing(true);
        }
      } else {
        setShowAddForm(true);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching addresses/profile:', error);
      setShowAddForm(true);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (showAddForm || savedAddresses.length === 0) {
      setAddress(next);
    }
    if (name === 'pincode' && validatePincode(value)) {
      handlePincodeLookup(value);
    }
  };

  const handlePincodeLookup = async (pincode) => {
    if (!pincode || !validatePincode(pincode)) {
      return;
    }

    try {
      const locationData = await getLocationFromPincode(pincode);
      
      if (locationData && locationData.state) {
        // Auto-fill state
        setFormData(prev => ({
          ...prev,
          state: locationData.state,
          city: locationData.city || locationData.locationName || prev.city,
          // Update address if location name is available
          addressLine: prev.addressLine || locationData.locationName || prev.addressLine
        }));
        
        setAddress(prev => ({
          ...prev,
          state: locationData.state,
          city: locationData.city || locationData.locationName || prev.city,
          pincode: pincode
        }));
        
        // Show success message with location name
        if (locationData.locationName) {
          showSuccess(`Location found: ${locationData.locationName}, ${locationData.district}, ${locationData.state}`);
        }
      }
    } catch (error) {
      console.error('Error looking up pincode:', error);
      // Don't show error to user, just log it
    }
  };

  const handleSelectAddress = (addr) => {
    const checkoutAddr = addressToCheckout(addr);
    setSelectedAddressId(addr._id);
    setAddress(checkoutAddr);
    setFormData(checkoutAddr);
    setShowAddForm(false);
    setIsEditing(false);
    onComplete && onComplete();
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.pincode || !formData.state ||
        !formData.addressLine || !formData.flatHouseCompany || !formData.city) {
      showError('Please fill in all required fields');
      return;
    }
    if (formData.name.trim().length < 3) {
      showError('Full name must be at least 3 characters');
      return;
    }
    if (!/^\d{10}$/.test(String(formData.phone).replace(/\D/g, ''))) {
      showError('Mobile number must be exactly 10 digits');
      return;
    }
    if (!/^\d{6}$/.test(String(formData.pincode))) {
      showError('Pincode must be exactly 6 digits');
      return;
    }

    try {
      const payload = checkoutToAddressPayload(formData);
      const response = await api.post('/addresses', payload);
      if (response.data.success) {
        showSuccess('Address saved. It will appear on your Addresses page too.');
        setAddress(formData);
        setIsEditing(false);
        setShowAddForm(false);
        await fetchAddressesAndProfile();
        const newAddr = response.data.address;
        if (newAddr) {
          setSelectedAddressId(newAddr._id);
          setAddress(addressToCheckout(newAddr));
        } else {
          setAddress(formData);
        }
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

  const showAddressList = savedAddresses.length > 0 && !showAddForm;
  const showForm = showAddForm || savedAddresses.length === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-dark-brown text-white rounded-full flex items-center justify-center font-semibold">
            1
          </div>
          <h2 className="text-xl font-bold text-dark-brown">Delivery Address</h2>
        </div>
        {showAddressList && (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Add new address
          </button>
        )}
      </div>

      {showAddressList && (
        <div className="space-y-4 mb-6">
          {savedAddresses.map((addr) => {
            const isSelected = selectedAddressId === addr._id;
            const checkoutAddr = addressToCheckout(addr);
            return (
              <div
                key={addr._id}
                className={`rounded-lg border-2 p-4 transition-colors ${
                  isSelected ? 'border-dark-brown bg-amber-50/50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{addr.fullName}</p>
                      <span className="px-2 py-0.5 text-xs font-medium text-white bg-dark-brown rounded">
                        {addr.addressType || 'Home'}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">Default</span>
                      )}
                    </div>
                    <p className="text-gray-700">{addr.flatHouseCompany}, {addr.address}</p>
                    <p className="text-gray-700">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-gray-600 text-sm">Mobile: {addr.mobileNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectAddress(addr)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                      isSelected
                        ? 'bg-dark-brown text-white cursor-default'
                        : 'bg-dark-brown/10 text-dark-brown hover:bg-dark-brown hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Deliver here'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm ? (
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
              <div className="relative">
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  onBlur={(e) => {
                    if (validatePincode(e.target.value)) {
                      handlePincodeLookup(e.target.value);
                    }
                  }}
                  maxLength="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                  placeholder="6-digit pincode"
                  required
                />
                {formData.pincode && validatePincode(formData.pincode) && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Valid pincode - Location will be auto-filled
                  </p>
                )}
              </div>
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
            {savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
                  handleSelectAddress(defaultAddr);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-dark-brown text-white rounded-lg hover:bg-accent-red font-medium transition-colors"
            >
              Save & Continue
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

