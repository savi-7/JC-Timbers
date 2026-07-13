import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNotification } from '../components/NotificationProvider';

export default function ServiceEnquiry() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    workType: 'Planing',
    requestedDate: '',
    requestedTime: '09:00',
    notes: '',
  });
  const [logItems, setLogItems] = useState([
    {
      id: Date.now(),
      woodType: '',
      numberOfLogs: '',
      thickness: '',
      width: '',
      length: '',
      cubicFeet: '',
    }
  ]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState(null);

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

  // Calculate cubic feet for a single log item
  const calculateCubicFeet = (thickness, width, length) => {
    const t = parseFloat(thickness) || 0;
    const w = parseFloat(width) || 0;
    const l = parseFloat(length) || 0;
    
    if (t > 0 && w > 0 && l > 0) {
      // Formula: cubic feet = (thickness × width × length) / 144
      return ((t * w * l) / 144).toFixed(2);
    }
    return '';
  };

  // Calculate total cubic feet
  const totalCubicFeet = logItems.reduce((sum, item) => {
    return sum + (parseFloat(item.cubicFeet) || 0);
  }, 0);

  const handleFormChange = (e) => {
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

  const handleLogItemChange = (index, field, value) => {
    setLogItems(prevItems => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-calculate cubic feet when dimensions change
      if (field === 'thickness' || field === 'width' || field === 'length') {
        const item = updated[index];
        const cubicFeet = calculateCubicFeet(item.thickness, item.width, item.length);
        updated[index] = { ...updated[index], cubicFeet };
      }
      
      return updated;
    });
    
    // Clear errors for this item
    if (errors[`logItem_${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`logItem_${index}_${field}`];
        return newErrors;
      });
    }
  };

  const addLogItem = () => {
    setLogItems(prevItems => [
      ...prevItems,
      {
        id: Date.now(),
        woodType: '',
        numberOfLogs: '',
        thickness: '',
        width: '',
        length: '',
        cubicFeet: '',
      }
    ]);
  };

  const removeLogItem = (index) => {
    if (logItems.length > 1) {
      setLogItems(prevItems => prevItems.filter((_, i) => i !== index));
    } else {
      showError('At least one log entry is required');
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
      const duration = 120;
      const response = await axios.get(`/services/schedule/available/${date}?duration=${duration}`);
      
      if (response.data.isHoliday) {
        setIsHoliday(true);
        setHolidayInfo({
          name: response.data.holidayName,
          description: response.data.holidayDescription,
          message: response.data.message
        });
        setAvailableSlots([]);
        setBookedSlots([]);
        setFormData((prev) => ({ ...prev, requestedTime: '' }));
        setErrors((prev) => ({ 
          ...prev, 
          requestedDate: response.data.message || 'This date is a holiday. Please select another date.',
          requestedTime: ''
        }));
        showError(response.data.message || 'This date is a holiday. Please select another date.');
        return;
      }
      
      setIsHoliday(false);
      setHolidayInfo(null);
      const available = response.data.availableSlots || [];
      const booked = response.data.bookedSlots || [];
      
      setAvailableSlots(available);
      setBookedSlots(booked);
      
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors.requestedDate && newErrors.requestedDate.includes('holiday')) {
          delete newErrors.requestedDate;
        }
        return newErrors;
      });
      
      if (formData.requestedTime) {
        const isBooked = booked.some(slot => {
          const [slotStartHour, slotStartMin] = slot.startTime.split(':').map(Number);
          const [slotEndHour, slotEndMin] = slot.endTime.split(':').map(Number);
          const [selectedHour, selectedMin] = formData.requestedTime.split(':').map(Number);
          const selectedMinutes = selectedHour * 60 + selectedMin;
          const slotStartMinutes = slotStartHour * 60 + slotStartMin;
          const slotEndMinutes = slotEndHour * 60 + slotEndMin;
          
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
      if (!allowedTypes.includes(file.type)) {
        showError(`${file.name} is not a valid image format. Please upload PNG, JPG, or WebP.`);
        return;
      }

      if (file.size > maxSize) {
        showError(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

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

    if (isHoliday) {
      newErrors.requestedDate = 'This date is a holiday. Please select another date.';
      setErrors(newErrors);
      showError('This date is a holiday. Please select another date.');
      return false;
    }

    if (!formData.workType) {
      newErrors.workType = 'Please select a processing category';
    }

    // Validate each log item
    logItems.forEach((item, index) => {
      if (!item.woodType) {
        newErrors[`logItem_${index}_woodType`] = 'Please select wood type';
      }
      if (!item.numberOfLogs || item.numberOfLogs < 1) {
        newErrors[`logItem_${index}_numberOfLogs`] = 'Please enter a valid number of logs';
      }
      if (!item.cubicFeet || parseFloat(item.cubicFeet) < 0.1) {
        newErrors[`logItem_${index}_cubicFeet`] = 'Please enter valid dimensions or cubic feet';
      }
    });

    if (totalCubicFeet < 0.1) {
      newErrors.totalCubicFeet = 'Total cubic feet must be at least 0.1';
    }

    if (!formData.requestedDate) {
      newErrors.requestedDate = 'Please select a date';
    }

    if (!formData.requestedTime) {
      newErrors.requestedTime = 'Please select a time';
    } else if (formData.requestedDate && bookedSlots.length > 0 && !isTimeAvailable(formData.requestedTime)) {
      newErrors.requestedTime = 'This time slot is already booked. Please select another time.';
      showError('The selected time slot is already booked. Please choose an available time.');
      return false;
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

      // Prepare log items for submission (remove id field)
      const logItemsToSubmit = logItems.map(({ id, ...item }) => ({
        woodType: item.woodType,
        numberOfLogs: parseInt(item.numberOfLogs),
        thickness: parseFloat(item.thickness),
        width: parseFloat(item.width),
        length: parseFloat(item.length),
        cubicFeet: parseFloat(item.cubicFeet),
      }));

      const submitData = new FormData();
      submitData.append('workType', formData.workType);
      submitData.append('logItems', JSON.stringify(logItemsToSubmit));
      submitData.append('cubicFeet', totalCubicFeet.toFixed(2));
      submitData.append('requestedDate', formData.requestedDate);
      submitData.append('requestedTime', formData.requestedTime);
      if (formData.notes) {
        submitData.append('notes', formData.notes);
      }

      images.forEach((image) => {
        submitData.append('images', image);
      });

      await axios.post('/services/enquiries', submitData);

      showSuccess('Service request submitted successfully! Our team will contact you soon.');
      
      setTimeout(() => {
        navigate('/services/my-enquiries');
      }, 2000);
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      let errorMessage = err.response?.data?.message || err.message || 'Failed to submit request. Please try again.';
      
      if (err.response?.status === 409) {
        errorMessage = err.response.data.message || 'This time slot is already booked. Please choose another time.';
        setFormData((prev) => ({ ...prev, requestedTime: '' }));
        if (formData.requestedDate) {
          checkAvailability(formData.requestedDate);
        }
      }
      
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
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-dark-brown transition-colors mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-paragraph text-sm">Back</span>
          </button>

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
                <label className="block text-sm font-medium text-dark-brown mb-2">
                  Processing Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleFormChange}
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

              {/* Log Items Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-dark-brown">Wood Log Entries</h3>
                  <button
                    type="button"
                    onClick={addLogItem}
                    className="px-4 py-2 text-sm font-paragraph bg-accent-red/10 text-accent-red rounded-lg hover:bg-accent-red/20 transition-colors border border-accent-red/30"
                  >
                    + Add Another Log
                  </button>
                </div>

                <div className="space-y-6">
                  {logItems.map((item, index) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-dark-brown">Log Entry {index + 1}</h4>
                        {logItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLogItem(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Wood Type & Number of Logs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-dark-brown mb-2">
                              Wood Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={item.woodType}
                              onChange={(e) => handleLogItemChange(index, 'woodType', e.target.value)}
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                                errors[`logItem_${index}_woodType`] ? 'border-red-300' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Select Wood Type</option>
                              {woodTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                            {errors[`logItem_${index}_woodType`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`logItem_${index}_woodType`]}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-dark-brown mb-2">
                              Number of Logs <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={item.numberOfLogs}
                              onChange={(e) => handleLogItemChange(index, 'numberOfLogs', e.target.value)}
                              min="1"
                              placeholder="e.g., 10"
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                                errors[`logItem_${index}_numberOfLogs`] ? 'border-red-300' : 'border-gray-300'
                              }`}
                            />
                            {errors[`logItem_${index}_numberOfLogs`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`logItem_${index}_numberOfLogs`]}</p>
                            )}
                          </div>
                        </div>

                        {/* Dimensions */}
                        <div>
                          <label className="block text-sm font-medium text-dark-brown mb-2">
                            Dimensions (for Cubic Feet calculation)
                          </label>
                          <div className="grid grid-cols-3 gap-3 mb-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Thickness (in)</label>
                              <input
                                type="number"
                                value={item.thickness}
                                onChange={(e) => handleLogItemChange(index, 'thickness', e.target.value)}
                                step="0.1"
                                min="0"
                                placeholder="Thickness"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Width (in)</label>
                              <input
                                type="number"
                                value={item.width}
                                onChange={(e) => handleLogItemChange(index, 'width', e.target.value)}
                                step="0.1"
                                min="0"
                                placeholder="Width"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Length (in)</label>
                              <input
                                type="number"
                                value={item.length}
                                onChange={(e) => handleLogItemChange(index, 'length', e.target.value)}
                                step="0.1"
                                min="0"
                                placeholder="Length"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Cubic feet: (Thickness × Width × Length) ÷ 144
                          </p>
                        </div>

                        {/* Cubic Feet Display */}
                        <div>
                          <label className="block text-sm font-medium text-dark-brown mb-2">
                            Cubic Feet (Auto-calculated)
                          </label>
                          <input
                            type="number"
                            value={item.cubicFeet}
                            onChange={(e) => handleLogItemChange(index, 'cubicFeet', e.target.value)}
                            step="0.1"
                            min="0.1"
                            placeholder="Auto-calculated or enter manually"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                              errors[`logItem_${index}_cubicFeet`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors[`logItem_${index}_cubicFeet`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`logItem_${index}_cubicFeet`]}</p>
                          )}
                          {item.cubicFeet && (
                            <p className="mt-1 text-xs text-gray-500">
                              Calculated: {item.cubicFeet} cubic feet
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Cubic Feet Display */}
                <div className="mt-4 p-4 bg-dark-brown/5 border border-dark-brown/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-dark-brown">Total Cubic Feet:</span>
                    <span className="text-lg font-semibold text-dark-brown">
                      {totalCubicFeet.toFixed(2)} cu ft
                    </span>
                  </div>
                  {errors.totalCubicFeet && (
                    <p className="mt-1 text-xs text-red-600">{errors.totalCubicFeet}</p>
                  )}
                </div>
              </div>

              {/* Requested Date & Time */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-dark-brown mb-4">Preferred Schedule</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-brown mb-2">
                      Requested Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="requestedDate"
                      value={formData.requestedDate}
                      onChange={handleFormChange}
                      min={getMinDate()}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                        errors.requestedDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.requestedDate && (
                      <p className="mt-1 text-xs text-red-600">{errors.requestedDate}</p>
                    )}
                    {/* Show holiday message */}
                    {isHoliday && holidayInfo && (
                      <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm font-medium text-orange-800">
                          🎉 Holiday: {holidayInfo.name}
                        </p>
                        {holidayInfo.description && (
                          <p className="text-xs text-orange-700 mt-1">{holidayInfo.description}</p>
                        )}
                        <p className="text-xs text-orange-600 mt-1">
                          No services are available on this date. Please select another date.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-brown mb-2">
                      Preferred Time <span className="text-red-500">*</span>
                      {checkingAvailability && (
                        <span className="ml-2 text-xs text-gray-500">(Checking availability...)</span>
                      )}
                    </label>
                    <input
                      type="time"
                      name="requestedTime"
                      value={formData.requestedTime}
                      onChange={handleFormChange}
                      min="09:00"
                      max="17:00"
                      step="1800"
                      disabled={isHoliday}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent ${
                        errors.requestedTime ? 'border-red-300' : 'border-gray-300'
                      } ${
                        formData.requestedTime && !isTimeAvailable(formData.requestedTime) 
                          ? 'border-orange-300 bg-orange-50' 
                          : ''
                      } ${
                        isHoliday ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
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
                    {formData.requestedDate && !isHoliday && (
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
                <label className="block text-sm font-medium text-dark-brown mb-2">
                  Upload Images of Wood (Optional)
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  multiple
                  onChange={handleImageChange}
                  disabled={images.length >= 5}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-red/10 file:text-accent-red hover:file:bg-accent-red/20 disabled:opacity-50"
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
                <label className="block text-sm font-medium text-dark-brown mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows="4"
                  placeholder="Any special requirements or additional information..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent"
                />
              </div>

              {/* Info Box */}
              <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-accent-red mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-dark-brown">
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
                  className="flex-1 px-6 py-3 text-dark-brown bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-paragraph border border-gray-300"
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
              className="text-accent-red hover:text-dark-brown font-medium transition-colors"
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
