import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MyServiceEnquiries() {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchEnquiries();
  }, [filterStatus]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await axios.get('/services/enquiries/my', { params });
      setEnquiries(response.data.enquiries || []);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this enquiry?')) {
      return;
    }

    try {
      await axios.put(`/services/enquiries/${id}/cancel`);
      fetchEnquiries();
    } catch (err) {
      console.error('Error cancelling enquiry:', err);
      alert(err.response?.data?.message || 'Failed to cancel enquiry');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ENQUIRY_RECEIVED: 'bg-blue-100 text-blue-800 border-blue-300',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      TIME_ACCEPTED: 'bg-green-100 text-green-800 border-green-300',
      ALTERNATE_TIME_PROPOSED: 'bg-orange-100 text-orange-800 border-orange-300',
      SCHEDULED: 'bg-purple-100 text-purple-800 border-purple-300',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      COMPLETED: 'bg-green-100 text-green-800 border-green-300',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Service Enquiries</h1>
                <p className="text-gray-600 mt-1">Track your service requests</p>
              </div>
              <button
                onClick={() => navigate('/services/enquiry')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Enquiry
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="ENQUIRY_RECEIVED">Enquiry Received</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="TIME_ACCEPTED">Time Accepted</option>
                <option value="ALTERNATE_TIME_PROPOSED">Alternate Time Proposed</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Enquiries List */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-sm text-gray-500">Loading enquiries...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-4">No enquiries found</p>
              <button
                onClick={() => navigate('/services/enquiry')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Submit your first enquiry →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enquiry) => (
                <div key={enquiry._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Status & Date */}
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(enquiry.status)}`}>
                          {formatStatus(enquiry.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Submitted on {new Date(enquiry.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>

                      {/* Work Type */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {enquiry.workType} Service
                      </h3>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Number of Logs</p>
                          <p className="text-sm font-medium text-gray-900">{enquiry.numberOfLogs}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cubic Feet</p>
                          <p className="text-sm font-medium text-gray-900">{enquiry.cubicFeet}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Requested Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(enquiry.requestedDate).toLocaleDateString('en-US')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Requested Time</p>
                          <p className="text-sm font-medium text-gray-900">{enquiry.requestedTime}</p>
                        </div>
                      </div>

                      {/* Accepted Time Info */}
                      {enquiry.status === 'TIME_ACCEPTED' && enquiry.acceptedDate && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-medium text-green-900 mb-1">✓ Your Requested Time Accepted!</p>
                          <p className="text-sm text-green-800">
                            {new Date(enquiry.acceptedDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-green-800 mt-1">
                            Time: {enquiry.acceptedStartTime} - {enquiry.acceptedEndTime}
                          </p>
                        </div>
                      )}

                      {/* Proposed Alternate Time Info */}
                      {enquiry.status === 'ALTERNATE_TIME_PROPOSED' && enquiry.proposedDate && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm font-medium text-orange-900 mb-1">⚠ Alternate Time Proposed:</p>
                          <p className="text-sm text-orange-800">
                            {new Date(enquiry.proposedDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-orange-800 mt-1">
                            Time: {enquiry.proposedStartTime} - {enquiry.proposedEndTime}
                          </p>
                          <p className="text-xs text-orange-700 mt-2">
                            Please contact us to confirm this new time or discuss alternatives.
                          </p>
                        </div>
                      )}

                      {/* Scheduled Info */}
                      {enquiry.status === 'SCHEDULED' && enquiry.scheduledDate && (
                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm font-medium text-purple-900 mb-1">Scheduled For:</p>
                          <p className="text-sm text-purple-800">
                            {new Date(enquiry.scheduledDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            {enquiry.scheduledTime && ` at ${enquiry.scheduledTime}`}
                          </p>
                        </div>
                      )}

                      {/* Estimated Cost */}
                      {enquiry.estimatedCost && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            Estimated Cost: <span className="font-semibold text-gray-900">₹{enquiry.estimatedCost}</span>
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {enquiry.notes && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500">Your Notes:</p>
                          <p className="text-sm text-gray-700">{enquiry.notes}</p>
                        </div>
                      )}

                      {/* Admin Notes */}
                      {enquiry.adminNotes && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs font-medium text-yellow-900 mb-1">Message from Admin:</p>
                          <p className="text-sm text-yellow-800">{enquiry.adminNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4">
                      {(enquiry.status === 'ENQUIRY_RECEIVED' || enquiry.status === 'UNDER_REVIEW') && (
                        <button
                          onClick={() => handleCancelEnquiry(enquiry._id)}
                          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
