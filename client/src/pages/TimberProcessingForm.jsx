import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/NotificationProvider';

export default function TimberProcessingForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    workType: 'Planing',
    woodType: '',
    numberOfLogs: '',
    length: '',
    breadth: '',
    height: '',
    cubicFeet: '',
    requestedDate: '',
    requestedTime: '09:00',
    name: user?.name || '',
    phoneNumber: '',
    notes: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const workTypes = ['Planing', 'Resawing', 'Debarking', 'Sawing', 'Other'];
  const woodTypes = [
    'Teak',
    'Rosewood',
    'Mahogany',
    'Pine',
    'Oak',
    'Maple',
    'Cedar',
    'Birch',
    'Walnut',
    'Cherry',
    'Other'
  ];

  // Calculate cubic feet from dimensions
  useEffect(() => {
    if (formData.length && formData.breadth && formData.height) {
      const length = parseFloat(formData.length) || 0;
      const breadth = parseFloat(formData.breadth) || 0;
      const height = parseFloat(formData.height) || 0;
      
      if (length > 0 && breadth > 0 && height > 0) {
        // Convert all to feet if needed (assuming inputs are in feet)
        // Formula: cubic feet = length × breadth × height
        const cubicFeet = (length * breadth * height).toFixed(2);
        setFormData((prev) => ({ ...prev, cubicFeet: cubicFeet }));
      } else {
        setFormData((prev) => ({ ...prev, cubicFeet: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, cubicFeet: '' }));
    }
  }, [formData.length, formData.breadth, formData.height]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Check availability when date changes
    if (name === 'requestedDate' && value) {
      checkAvailability(value);
    }
    
    // Validate time availability when time changes
    if (name === 'requestedTime' && value && formData.requestedDate) {
      if (!isTimeAvailable(value)) {
        setErrors((prev) => ({ 
          ...prev, 
          requestedTime: 'This time slot is already booked. Please select another time.' 
        }));
      }
    }
  };

  // Check available time slots for a given date
  const checkAvailability = async (date) => {
    if (!date) {
      setAvailableSlots([]);
      setBookedSlots([]);
      return;
    }
    
    try {
      setCheckingAvailability(true);
      // Default duration is 2 hours (120 minutes)
      const duration = 120;
      const response = await axios.get(`/services/schedule/available/${date}?duration=${duration}`);
      
      console.log('Availability response:', response.data);
      
      const available = response.data.availableSlots || [];
      const booked = response.data.bookedSlots || [];
      
      console.log('Available slots:', available);
      console.log('Booked slots:', booked);
      
      setAvailableSlots(available);
      setBookedSlots(booked);
      
      // Show message if no slots available
      if (available.length === 0 && booked.length > 0) {
        console.warn('No available slots for this date');
      }
      
      // If current selected time is booked, clear it and show error
      if (formData.requestedTime) {
        const isBooked = booked.some(slot => {
          const [slotStartHour, slotStartMin] = slot.startTime.split(':').map(Number);
          const [slotEndHour, slotEndMin] = slot.endTime.split(':').map(Number);
          const [selectedHour, selectedMin] = formData.requestedTime.split(':').map(Number);
          const selectedMinutes = selectedHour * 60 + selectedMin;
          const slotStartMinutes = slotStartHour * 60 + slotStartMin;
          const slotEndMinutes = slotEndHour * 60 + slotEndMin;
          
          // Check if selected time falls within booked slot
          return selectedMinutes >= slotStartMinutes && selectedMinutes < slotEndMinutes;
        });
        
        if (isBooked) {
          setFormData((prev) => ({ ...prev, requestedTime: '' }));
          setErrors((prev) => ({ 
            ...prev, 
            requestedTime: 'The selected time slot is already booked. Please choose another time.' 
          }));
          showError('The selected time slot is already booked. Please choose another time.');
        }
      }
    } catch (err) {
      console.error('Error checking availability:', err);
      console.error('Error details:', err.response?.data);
      showError('Failed to check availability. Please try again.');
      setAvailableSlots([]);
      setBookedSlots([]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Check availability when date is selected
  useEffect(() => {
    if (formData.requestedDate) {
      checkAvailability(formData.requestedDate);
    } else {
      setAvailableSlots([]);
      setBookedSlots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.requestedDate]);

  // Check if a time slot is available
  const isTimeAvailable = (time) => {
    if (!time || bookedSlots.length === 0) return true;
    
    const [selectedHour, selectedMin] = time.split(':').map(Number);
    const selectedMinutes = selectedHour * 60 + selectedMin;
    
    return !bookedSlots.some(slot => {
      const [slotStartHour, slotStartMin] = slot.startTime.split(':').map(Number);
      const [slotEndHour, slotEndMin] = slot.endTime.split(':').map(Number);
      const slotStartMinutes = slotStartHour * 60 + slotStartMin;
      const slotEndMinutes = slotEndHour * 60 + slotEndMin;
      
      // Check if selected time falls within a booked slot
      return selectedMinutes >= slotStartMinutes && selectedMinutes < slotEndMinutes;
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    
    if (files.length + images.length > maxFiles) {
      showError(`You can upload maximum ${maxFiles} images`);
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    files.forEach((file) => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        showError(`${file.name} is not a valid image format. Please upload PNG, JPG, or WebP.`);
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        showError(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
      setImages((prev) => [...prev, file]);
    });

    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.workType) {
      newErrors.workType = 'Please select a processing category';
    }

    if (!formData.woodType) {
      newErrors.woodType = 'Please select wood type';
    }

    if (!formData.numberOfLogs || formData.numberOfLogs < 1) {
      newErrors.numberOfLogs = 'Please enter a valid number of logs';
    }

    if (!formData.cubicFeet || parseFloat(formData.cubicFeet) < 0.1) {
      newErrors.cubicFeet = 'Please enter valid dimensions or cubic feet';
    }

    if (!formData.requestedDate) {
      newErrors.requestedDate = 'Please select a date';
    }

    if (!formData.requestedTime) {
      newErrors.requestedTime = 'Please select a time';
    } else if (formData.requestedDate && bookedSlots.length > 0 && !isTimeAvailable(formData.requestedTime)) {
      newErrors.requestedTime = 'This time slot is already booked. Please select another time.';
      showError('The selected time slot is already booked. Please choose an available time.');
      return false; // Prevent submission
    }

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your name';
    }

    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fill in all required fields correctly');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('workType', formData.workType);
      submitData.append('woodType', formData.woodType);
      submitData.append('numberOfLogs', formData.numberOfLogs);
      submitData.append('cubicFeet', formData.cubicFeet);
      submitData.append('requestedDate', formData.requestedDate);
      submitData.append('requestedTime', formData.requestedTime);
      submitData.append('name', formData.name);
      submitData.append('phoneNumber', formData.phoneNumber);
      if (formData.notes) {
        submitData.append('notes', formData.notes);
      }

      // Append images
      images.forEach((image, index) => {
        submitData.append('images', image);
      });

      // Get token and add it explicitly to ensure it's sent
      const token = localStorage.getItem('token');
      if (!token) {
        showError('You must be logged in to submit a request');
        navigate('/login');
        return;
      }

      // Don't set Content-Type manually - axios will set it automatically with the correct boundary for FormData
      await axios.post('/services/enquiries', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      showSuccess('Service request submitted successfully! Our team will contact you soon.');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/services/my-enquiries');
      }, 2000);
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      let errorMessage = err.response?.data?.message || err.message || 'Failed to submit request. Please try again.';
      
      // Handle conflict errors (409)
      if (err.response?.status === 409) {
        errorMessage = err.response.data.message || 'This time slot is already booked. Please choose another time.';
        // Clear the time field
        setFormData((prev) => ({ ...prev, requestedTime: '' }));
        // Re-check availability
        if (formData.requestedDate) {
          checkAvailability(formData.requestedDate);
        }
      }
      
      // Don't show error if user is being redirected to login (auth interceptor handles it)
      if (err.response?.status !== 401) {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-heading text-dark-brown mb-2">
              Timber Cutting & Processing Request
            </h1>
            <p className="text-gray-600">
              Submit your wood processing service request with details
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
              {/* Processing Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                    errors.workType ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {workTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.workType && (
                  <p className="mt-1 text-xs text-red-600">{errors.workType}</p>
                )}
              </div>

              {/* Wood Type & Number of Logs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wood Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="woodType"
                    value={formData.woodType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                      errors.woodType ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Wood Type</option>
                    {woodTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.woodType && (
                    <p className="mt-1 text-xs text-red-600">{errors.woodType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Logs <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="numberOfLogs"
                    value={formData.numberOfLogs}
                    onChange={handleChange}
                    min="1"
                    placeholder="e.g., 10"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                      errors.numberOfLogs ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.numberOfLogs && (
                    <p className="mt-1 text-xs text-red-600">{errors.numberOfLogs}</p>
                  )}
                </div>
              </div>

              {/* Dimensions for Cubic Feet Calculation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (for Cubic Feet calculation)
                </label>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Length (ft)</label>
                    <input
                      type="number"
                      name="length"
                      value={formData.length}
                      onChange={handleChange}
                      step="0.1"
                      min="0"
                      placeholder="Length"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Breadth (ft)</label>
                    <input
                      type="number"
                      name="breadth"
                      value={formData.breadth}
                      onChange={handleChange}
                      step="0.1"
                      min="0"
                      placeholder="Breadth"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Height (ft)</label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      step="0.1"
                      min="0"
                      placeholder="Height"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Cubic feet will be calculated automatically: Length × Breadth × Height
                </p>
              </div>

              {/* Cubic Feet (Auto-calculated or Manual Entry) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Cubic Feet <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="cubicFeet"
                  value={formData.cubicFeet}
                  onChange={handleChange}
                  step="0.1"
                  min="0.1"
                  placeholder="Auto-calculated or enter manually"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                    errors.cubicFeet ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.cubicFeet && (
                  <p className="mt-1 text-xs text-red-600">{errors.cubicFeet}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.length && formData.breadth && formData.height
                    ? `Calculated: ${formData.cubicFeet} cubic feet`
                    : 'Enter dimensions above or input manually'}
                </p>
              </div>

              {/* Personal Details */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-dark-brown mb-4">Personal Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="e.g., 9876543210"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                        errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Requested Date & Time */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-dark-brown mb-4">Preferred Schedule</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requested Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="requestedDate"
                      value={formData.requestedDate}
                      onChange={handleChange}
                      min={getMinDate()}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                        errors.requestedDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.requestedDate && (
                      <p className="mt-1 text-xs text-red-600">{errors.requestedDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time <span className="text-red-500">*</span>
                      {checkingAvailability && (
                        <span className="ml-2 text-xs text-gray-500">(Checking availability...)</span>
                      )}
                    </label>
                    <input
                      type="time"
                      name="requestedTime"
                      value={formData.requestedTime}
                      onChange={handleChange}
                      min="09:00"
                      max="17:00"
                      step="1800"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                        errors.requestedTime ? 'border-red-300' : 'border-gray-300'
                      } ${
                        formData.requestedTime && !isTimeAvailable(formData.requestedTime) 
                          ? 'border-orange-300 bg-orange-50' 
                          : ''
                      }`}
                    />
                    {errors.requestedTime && (
                      <p className="mt-1 text-xs text-red-600">{errors.requestedTime}</p>
                    )}
                    
                    {/* Show booked slots */}
                    {formData.requestedDate && bookedSlots.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">Booked time slots:</p>
                        <div className="flex flex-wrap gap-2">
                          {bookedSlots.map((slot, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-800"
                            >
                              {slot.startTime} - {slot.endTime}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Show available slots */}
                    {formData.requestedDate && (
                      <div className="mt-2">
                        {availableSlots.length > 0 ? (
                          <>
                            <p className="text-xs text-gray-600 mb-1">Available time slots:</p>
                            <div className="flex flex-wrap gap-2">
                              {availableSlots.map((slot, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                                >
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              ))}
                            </div>
                          </>
                        ) : bookedSlots.length > 0 ? (
                          <p className="text-xs text-orange-600">No available slots for this date. All time slots are booked.</p>
                        ) : !checkingAvailability ? (
                          <p className="text-xs text-gray-500">Select a date to see available time slots</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images of Wood (Optional)
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  multiple
                  onChange={handleImageChange}
                  disabled={images.length >= 5}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum 5 images, 5MB each (PNG, JPG, WebP)
                </p>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Any special requirements or additional information..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent"
                />
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Important Information:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>This is a service request, not a confirmed booking</li>
                      <li>Our team will review and contact you within 24 hours</li>
                      <li>Working hours: 09:00 AM to 05:00 PM</li>
                      <li>If your requested slot is available, we'll confirm it</li>
                      <li>If unavailable, we'll propose an alternative time</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-dark-brown text-white rounded-lg hover:bg-accent-red transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-paragraph"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>

          {/* My Enquiries Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/services/my-enquiries')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View My Previous Requests →
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
