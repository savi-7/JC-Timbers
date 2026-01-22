import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ServiceEnquiry() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    workType: 'Planing',
    numberOfLogs: '',
    cubicFeet: '',
    requestedDate: '',
    requestedTime: '09:00',
    phoneNumber: '',
    notes: '',
  });

  const workTypes = ['Planing', 'Resawing', 'Debarking', 'Sawing'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.numberOfLogs || formData.numberOfLogs < 1) {
      setError('Please enter a valid number of logs');
      return;
    }

    if (!formData.cubicFeet || formData.cubicFeet < 0.1) {
      setError('Please enter a valid cubic feet value');
      return;
    }

    if (!formData.requestedDate) {
      setError('Please select a date');
      return;
    }

    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await axios.post('/services/enquiries', {
        workType: formData.workType,
        numberOfLogs: parseInt(formData.numberOfLogs),
        cubicFeet: parseFloat(formData.cubicFeet),
        requestedDate: formData.requestedDate,
        requestedTime: formData.requestedTime,
        phoneNumber: formData.phoneNumber,
        notes: formData.notes,
      });

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/services/my-enquiries');
      }, 2000);
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      setError(err.response?.data?.message || 'Failed to submit enquiry');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Enquiry</h1>
            <p className="text-gray-600">Submit your wood processing service request</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-medium text-green-800">Enquiry Submitted Successfully!</p>
                  <p className="text-sm text-green-600">We will review your request and contact you soon. Redirecting...</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Work Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {workTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of Logs & Cubic Feet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    required
                    placeholder="e.g., 10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cubic Feet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="cubicFeet"
                    value={formData.cubicFeet}
                    onChange={handleChange}
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="e.g., 50.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Requested Date & Time */}
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
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="requestedTime"
                    value={formData.requestedTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 9876543210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notes */}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Important Information:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>This is an enquiry, not a confirmed booking</li>
                      <li>Our team will review and contact you within 24 hours</li>
                      <li>Working hours: 09:00 AM to 05:00 PM</li>
                      <li>Actual scheduling will be confirmed by our team</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Enquiry'}
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
              View My Previous Enquiries →
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
