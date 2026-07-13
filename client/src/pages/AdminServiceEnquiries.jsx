import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';

export default function AdminServiceEnquiries() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWorkType, setFilterWorkType] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    adminNotes: '',
    scheduledDate: '',
    scheduledTime: '',
    estimatedCost: '',
  });
  const [acceptData, setAcceptData] = useState({
    duration: 60,
    adminNotes: '',
  });
  const [proposeData, setProposeData] = useState({
    proposedDate: '',
    proposedStartTime: '09:00',
    duration: 60,
    adminNotes: '',
  });

  useEffect(() => {
    fetchEnquiries();
  }, [filterStatus, filterWorkType]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterWorkType) params.workType = filterWorkType;

      const response = await axios.get('/services/admin/enquiries', { params });
      setEnquiries(response.data.enquiries || []);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setUpdateData({
      status: enquiry.status,
      adminNotes: enquiry.adminNotes || '',
      scheduledDate: enquiry.scheduledDate ? new Date(enquiry.scheduledDate).toISOString().split('T')[0] : '',
      scheduledTime: enquiry.scheduledTime || '',
      estimatedCost: enquiry.estimatedCost || '',
    });
    setShowModal(true);
  };

  const handleUpdateEnquiry = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/services/admin/enquiries/${selectedEnquiry._id}`, {
        status: updateData.status,
        adminNotes: updateData.adminNotes,
        scheduledDate: updateData.scheduledDate || null,
        scheduledTime: updateData.scheduledTime || null,
        estimatedCost: updateData.estimatedCost ? parseFloat(updateData.estimatedCost) : null,
      });

      setShowModal(false);
      fetchEnquiries();
    } catch (err) {
      console.error('Error updating enquiry:', err);
      setError(err.response?.data?.message || 'Failed to update enquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) {
      return;
    }

    try {
      await axios.delete(`/services/admin/enquiries/${id}`);
      fetchEnquiries();
    } catch (err) {
      console.error('Error deleting enquiry:', err);
      setError('Failed to delete enquiry');
    }
  };

  const handleAcceptRequestedTime = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await axios.post(`/services/admin/enquiries/${selectedEnquiry._id}/accept-time`, {
        duration: parseInt(acceptData.duration),
        adminNotes: acceptData.adminNotes,
      });

      setShowAcceptModal(false);
      setShowModal(false);
      fetchEnquiries();
      alert('Requested time accepted successfully');
    } catch (err) {
      console.error('Error accepting time:', err);
      setError(err.response?.data?.message || 'Failed to accept time');
    } finally {
      setLoading(false);
    }
  };

  const handleProposeAlternateTime = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await axios.post(`/services/admin/enquiries/${selectedEnquiry._id}/propose-time`, {
        proposedDate: proposeData.proposedDate,
        proposedStartTime: proposeData.proposedStartTime,
        duration: parseInt(proposeData.duration),
        adminNotes: proposeData.adminNotes,
      });

      setShowProposeModal(false);
      setShowModal(false);
      fetchEnquiries();
      alert('Alternate time proposed successfully');
    } catch (err) {
      console.error('Error proposing time:', err);
      setError(err.response?.data?.message || 'Failed to propose time');
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + parseInt(duration);
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
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
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Service Enquiries</h1>
            <p className="text-sm text-gray-500 mt-1">Manage customer service requests</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
                <select
                  value={filterWorkType}
                  onChange={(e) => setFilterWorkType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="Planing">Planing</option>
                  <option value="Resawing">Resawing</option>
                  <option value="Debarking">Debarking</option>
                  <option value="Sawing">Sawing</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterStatus('');
                    setFilterWorkType('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Enquiries List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-sm text-gray-500">Loading enquiries...</p>
              </div>
            ) : enquiries.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No enquiries found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enquiries.map((enquiry) => (
                      <tr key={enquiry._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{enquiry.customerName}</div>
                            <div className="text-sm text-gray-500">{enquiry.phoneNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{enquiry.workType}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {enquiry.numberOfLogs} logs
                          </div>
                          <div className="text-sm text-gray-500">
                            {enquiry.cubicFeet} cu ft
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(enquiry.requestedDate).toLocaleDateString('en-US')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {enquiry.requestedTime}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(enquiry.status)}`}>
                            {formatStatus(enquiry.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleViewEnquiry(enquiry)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteEnquiry(enquiry._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Enquiry Details</h2>
            </div>

            <form onSubmit={handleUpdateEnquiry} className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedEnquiry.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedEnquiry.phoneNumber}</p>
                  </div>
                  {selectedEnquiry.customerEmail && (
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedEnquiry.customerEmail}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Service Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Work Type</p>
                    <p className="text-sm font-medium text-gray-900">{selectedEnquiry.workType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Number of Logs</p>
                    <p className="text-sm font-medium text-gray-900">{selectedEnquiry.numberOfLogs}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cubic Feet</p>
                    <p className="text-sm font-medium text-gray-900">{selectedEnquiry.cubicFeet}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requested Date & Time</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedEnquiry.requestedDate).toLocaleDateString('en-US')} at {selectedEnquiry.requestedTime}
                    </p>
                  </div>
                </div>
                {selectedEnquiry.notes && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Customer Notes</p>
                    <p className="text-sm text-gray-700 mt-1">{selectedEnquiry.notes}</p>
                  </div>
                )}
              </div>

              {/* Decision Actions */}
              {(selectedEnquiry.status === 'ENQUIRY_RECEIVED' || selectedEnquiry.status === 'UNDER_REVIEW') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-3">Admin Decision</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAcceptData({ duration: 60, adminNotes: '' });
                        setShowAcceptModal(true);
                      }}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Accept Requested Time</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProposeData({ 
                          proposedDate: '', 
                          proposedStartTime: '09:00', 
                          duration: 60, 
                          adminNotes: '' 
                        });
                        setShowProposeModal(true);
                      }}
                      className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Propose Alternate Time</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Update Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={updateData.scheduledDate}
                    onChange={(e) => setUpdateData({ ...updateData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
                  <input
                    type="time"
                    value={updateData.scheduledTime}
                    onChange={(e) => setUpdateData({ ...updateData, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (₹)</label>
                <input
                  type="number"
                  value={updateData.estimatedCost}
                  onChange={(e) => setUpdateData({ ...updateData, estimatedCost: e.target.value })}
                  min="0"
                  step="0.01"
                  placeholder="Enter estimated cost"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                <textarea
                  value={updateData.adminNotes}
                  onChange={(e) => setUpdateData({ ...updateData, adminNotes: e.target.value })}
                  rows="4"
                  placeholder="Add notes for the customer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Updating...' : 'Update Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accept Time Modal */}
      {showAcceptModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Accept Requested Time</h2>
            </div>

            <form onSubmit={handleAcceptRequestedTime} className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Customer Requested:</strong>
                </p>
                <p className="text-sm text-blue-800">
                  {new Date(selectedEnquiry.requestedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  Start Time: {selectedEnquiry.requestedTime}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <select
                  value={acceptData.duration}
                  onChange={(e) => setAcceptData({ ...acceptData, duration: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                  <option value="300">5 hours</option>
                  <option value="360">6 hours</option>
                  <option value="420">7 hours</option>
                  <option value="480">8 hours</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  End time will be: {calculateEndTime(selectedEnquiry.requestedTime, acceptData.duration)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to Customer (Optional)
                </label>
                <textarea
                  value={acceptData.adminNotes}
                  onChange={(e) => setAcceptData({ ...acceptData, adminNotes: e.target.value })}
                  rows="3"
                  placeholder="Add a message for the customer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAcceptModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Accepting...' : 'Accept Time'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Propose Alternate Time Modal */}
      {showProposeModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Propose Alternate Time</h2>
            </div>

            <form onSubmit={handleProposeAlternateTime} className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900 mb-2">
                  <strong>Customer Requested:</strong>
                </p>
                <p className="text-sm text-yellow-800">
                  {new Date(selectedEnquiry.requestedDate).toLocaleDateString('en-US')} at {selectedEnquiry.requestedTime}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proposed Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={proposeData.proposedDate}
                  onChange={(e) => setProposeData({ ...proposeData, proposedDate: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proposed Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={proposeData.proposedStartTime}
                  onChange={(e) => setProposeData({ ...proposeData, proposedStartTime: e.target.value })}
                  required
                  min="09:00"
                  max="17:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <select
                  value={proposeData.duration}
                  onChange={(e) => setProposeData({ ...proposeData, duration: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                  <option value="300">5 hours</option>
                  <option value="360">6 hours</option>
                  <option value="420">7 hours</option>
                  <option value="480">8 hours</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  End time will be: {calculateEndTime(proposeData.proposedStartTime, proposeData.duration)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to Customer (Optional)
                </label>
                <textarea
                  value={proposeData.adminNotes}
                  onChange={(e) => setProposeData({ ...proposeData, adminNotes: e.target.value })}
                  rows="3"
                  placeholder="Explain why you're proposing an alternate time..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Proposing...' : 'Propose Time'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
