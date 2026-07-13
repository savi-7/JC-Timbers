import React, { useState } from 'react';
import { getLocationFromPincode, validatePincode } from '../utils/pincodeLookup';
import { useNotification } from './NotificationProvider';

/**
 * Reusable Pincode Input Component with Auto-fill
 * Automatically fills city, state, and location name when valid pincode is entered
 */
export default function PincodeInput({
  value,
  onChange,
  onLocationFound,
  error,
  className = '',
  placeholder = '6-digit pincode',
  showLocationInfo = true,
  disabled = false
}) {
  const { showSuccess, showError } = useNotification();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    onChange(e); // Call parent's onChange

    // Auto-lookup when valid pincode is entered
    if (validatePincode(pincode)) {
      await lookupLocation(pincode);
    } else {
      setLocationInfo(null);
    }
  };

  const handleBlur = async (e) => {
    const pincode = e.target.value;
    if (validatePincode(pincode)) {
      await lookupLocation(pincode);
    }
  };

  const lookupLocation = async (pincode) => {
    if (!pincode || !validatePincode(pincode)) {
      return;
    }

    try {
      setIsLookingUp(true);
      const locationData = await getLocationFromPincode(pincode);

      if (locationData && locationData.state) {
        setLocationInfo(locationData);

        // Call parent callback with location data
        if (onLocationFound) {
          onLocationFound({
            city: locationData.city || locationData.locationName,
            state: locationData.state,
            district: locationData.district,
            locationName: locationData.locationName
          });
        }

        // Show success message with exact location name
        if (locationData.locationName) {
          const locationText = `${locationData.locationName}${locationData.district ? `, ${locationData.district}` : ''}, ${locationData.state}`;
          showSuccess(`Location found: ${locationText}`);
        }
      } else {
        setLocationInfo(null);
        showError('Location not found for this pincode. Please enter manually.');
      }
    } catch (error) {
      console.error('Error looking up pincode:', error);
      setLocationInfo(null);
      // Don't show error to user for network issues, just log it
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={handlePincodeChange}
        onBlur={handleBlur}
        maxLength="6"
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        placeholder={placeholder}
      />
      
      {/* Loading indicator */}
      {isLookingUp && (
        <p className="mt-1 text-xs text-blue-600">Looking up location...</p>
      )}
      
      {/* Valid pincode indicator */}
      {value && validatePincode(value) && !isLookingUp && !error && (
        <p className="mt-1 text-xs text-green-600">
          ✓ Valid pincode
        </p>
      )}
      
      {/* Location info */}
      {locationInfo && showLocationInfo && !isLookingUp && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
          <p className="text-green-800 font-semibold">
            📍 {locationInfo.locationName || locationInfo.city}
          </p>
          {locationInfo.district && (
            <p className="text-green-700">District: {locationInfo.district}</p>
          )}
          <p className="text-green-700">State: {locationInfo.state}</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
