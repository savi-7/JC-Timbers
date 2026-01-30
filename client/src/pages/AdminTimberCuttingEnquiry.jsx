import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';
import { useNotification } from '../components/NotificationProvider';

export default function AdminTimberCuttingEnquiry() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWorkType, setFilterWorkType] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availabilityData, setAvailabilityData] = useState(null);
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
  const [holidayData, setHolidayData] = useState({
    date: '',
    name: '',
    description: '',
    isRecurring: false,
  });

  useEffect(() => {
    fetchEnquiries();
    fetchHolidays();
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
      showError('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await axios.get('/holidays');
      setHolidays(response.data.holidays || []);
    } catch (err) {
      console.error('Error fetching holidays:', err);
    }
  };

  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + parseInt(duration);
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const checkAvailability = async (date, time, duration) => {
    try {
      setLoading(true);
      // Check if date is a holiday
      const holidayCheck = await axios.get(`/holidays/check?date=${date}`);
      if (holidayCheck.data.isHoliday) {
        return {
          available: false,
          reason: 'This date is marked as a holiday',
          holiday: holidayCheck.data.holiday,
        };
      }

      // Check existing bookings for this date and time
      try {
        const scheduleResponse = await axios.get(`/services/admin/schedule/date/${date}`);
        const existingBookings = scheduleResponse.data.schedules || [];

      // Calculate end time
      const endTime = calculateEndTime(time, duration);

        // Check for conflicts in schedule blocks
        const scheduleConflicts = existingBookings.filter((booking) => {
          if (booking.status === 'cancelled' || booking.status === 'completed') return false;
          
          const bookingStart = booking.startTime;
          const bookingEnd = booking.endTime;
          
          // Check if times overlap
          return (
            (time >= bookingStart && time < bookingEnd) ||
            (endTime > bookingStart && endTime <= bookingEnd) ||
            (time <= bookingStart && endTime >= bookingEnd)
          );
        });
        
        // Also check scheduled enquiries for conflicts
        const enquiriesResponse = await axios.get('/services/admin/enquiries');
        const allEnquiries = enquiriesResponse.data.enquiries || [];
        const scheduledEnquiries = allEnquiries.filter((enq) => 
          enq.status === 'SCHEDULED' || enq.status === 'TIME_ACCEPTED' || enq.status === 'IN_PROGRESS'
        );
        
        const enquiryConflicts = scheduledEnquiries.filter((enq) => {
          if (!enq.requestedDate) return false;
          const enqDate = new Date(enq.requestedDate).toISOString().split('T')[0];
          if (enqDate !== date) return false;
          
          const enqStart = enq.acceptedStartTime || enq.scheduledTime || enq.requestedTime;
          const enqEnd = enq.acceptedEndTime || calculateEndTime(enqStart, 60);
          
          if (!enqStart || !enqEnd) return false;
          
          return (
            (time >= enqStart && time < enqEnd) ||
            (endTime > enqStart && endTime <= enqEnd) ||
            (time <= enqStart && endTime >= enqEnd)
          );
        });
        
        const conflicts = [...scheduleConflicts, ...enquiryConflicts];

      if (conflicts.length > 0) {
        return {
          available: false,
          reason: 'Time slot is already booked',
          conflicts: conflicts,
        };
      }

        return {
          available: true,
          message: 'Time slot is available',
        };
      } catch (scheduleErr) {
        // If schedule endpoint fails, still check enquiries for the same date/time
        const enquiriesResponse = await axios.get('/services/admin/enquiries', {
          params: { status: 'SCHEDULED' }
        });
        const scheduledEnquiries = enquiriesResponse.data.enquiries || [];
        
        const conflicts = scheduledEnquiries.filter((enq) => {
          if (!enq.scheduledDate || !enq.scheduledTime) return false;
          const enqDate = new Date(enq.scheduledDate).toISOString().split('T')[0];
          return enqDate === date && enq.scheduledTime === time;
        });
        
        if (conflicts.length > 0) {
          return {
            available: false,
            reason: 'Time slot is already booked',
            conflicts: conflicts,
          };
        }
        
        return {
          available: true,
          message: 'Time slot is available',
        };
      }
    } catch (err) {
      console.error('Error checking availability:', err);
      return {
        available: false,
        reason: 'Error checking availability',
      };
    } finally {
      setLoading(false);
    }
  };

  const handleViewEnquiry = async (enquiry) => {
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

  const handleCheckAvailability = async () => {
    if (!selectedEnquiry) return;
    
    const availability = await checkAvailability(
      selectedEnquiry.requestedDate,
      selectedEnquiry.requestedTime,
      60 // Default duration
    );
    
    setAvailabilityData(availability);
    setShowAvailabilityModal(true);
  };

  const handleAcceptRequestedTime = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Check availability before accepting
      const availability = await checkAvailability(
        selectedEnquiry.requestedDate,
        selectedEnquiry.requestedTime,
        acceptData.duration
      );

      if (!availability.available) {
        setError(availability.reason || 'Time slot is not available');
        showError(availability.reason || 'Time slot is not available');
        return;
      }

      await axios.post(`/services/admin/enquiries/${selectedEnquiry._id}/accept-time`, {
        duration: parseInt(acceptData.duration),
        adminNotes: acceptData.adminNotes,
      });

      // Update status to CONFIRMED
      await axios.put(`/services/admin/enquiries/${selectedEnquiry._id}`, {
        status: 'SCHEDULED',
      });

      setShowAcceptModal(false);
      setShowModal(false);
      fetchEnquiries();
      showSuccess('Request confirmed successfully! Customer has been notified.');
    } catch (err) {
      console.error('Error accepting time:', err);
      const errorMsg = err.response?.data?.message || 'Failed to accept time';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleProposeAlternateTime = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Check availability of proposed time
      const availability = await checkAvailability(
        proposeData.proposedDate,
        proposeData.proposedStartTime,
        proposeData.duration
      );

      if (!availability.available) {
        setError(availability.reason || 'Proposed time slot is not available');
        showError(availability.reason || 'Proposed time slot is not available');
        return;
      }

      await axios.post(`/services/admin/enquiries/${selectedEnquiry._id}/propose-time`, {
        proposedDate: proposeData.proposedDate,
        proposedStartTime: proposeData.proposedStartTime,
        duration: parseInt(proposeData.duration),
        adminNotes: proposeData.adminNotes,
      });

      setShowProposeModal(false);
      setShowModal(false);
      fetchEnquiries();
      showSuccess('Alternate time proposed successfully! Customer has been notified.');
    } catch (err) {
      console.error('Error proposing time:', err);
      const errorMsg = err.response?.data?.message || 'Failed to propose time';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      const updatePayload = { status: newStatus };
      
      // If marking as completed, set completedAt
      if (newStatus === 'COMPLETED') {
        updatePayload.completedAt = new Date().toISOString();
      }
      
      await axios.put(`/services/admin/enquiries/${selectedEnquiry._id}`, updatePayload);

      setShowModal(false);
      fetchEnquiries();
      
      const statusMessages = {
        'IN_PROGRESS': 'Status updated to In Progress. Customer has been notified.',
        'COMPLETED': 'Service marked as Completed. Customer has been notified.',
        'CANCELLED': 'Request cancelled',
      };
      
      showSuccess(statusMessages[newStatus] || 'Status updated successfully');
    } catch (err) {
      console.error('Error updating status:', err);
      showError('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/holidays', holidayData);
      
      setShowHolidayModal(false);
      setHolidayData({ date: '', name: '', description: '', isRecurring: false });
      fetchHolidays();
      showSuccess('Holiday created successfully. This date is now blocked for bookings.');
    } catch (err) {
      console.error('Error creating holiday:', err);
      showError(err.response?.data?.message || 'Failed to create holiday');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      await axios.delete(`/holidays/${id}`);
      fetchHolidays();
      showSuccess('Holiday deleted successfully');
    } catch (err) {
      console.error('Error deleting holiday:', err);
      showError('Failed to delete holiday');
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

  const pendingEnquiries = enquiries.filter(
    (e) => e.status === 'ENQUIRY_RECEIVED' || e.status === 'UNDER_REVIEW'
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Timber Cutting Enquiry</h1>
              <p className="text-sm text-gray-500 mt-1">Manage timber processing service requests</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHolidayModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Manage Holidays
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">New/Pending</p>
                  <p className="text-2xl font-bold text-blue-600">{pendingEnquiries.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Scheduled</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {enquiries.filter((e) => e.status === 'SCHEDULED' || e.status === 'TIME_ACCEPTED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {enquiries.filter((e) => e.status === 'IN_PROGRESS').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {enquiries.filter((e) => e.status === 'COMPLETED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
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
                  <option value="Other">Other</option>
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
            {loading && !enquiries.length ? (
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Details</th>
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
                            {enquiry.customerEmail && (
                              <div className="text-xs text-gray-400">{enquiry.customerEmail}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{enquiry.workType}</div>
                            {enquiry.logItems && enquiry.logItems.length > 0 ? (
                              <div className="text-gray-500">
                                {enquiry.logItems.length} log {enquiry.logItems.length === 1 ? 'entry' : 'entries'} • {enquiry.cubicFeet} cu ft total
                              </div>
                            ) : (
                              <>
                                {enquiry.woodType && (
                                  <div className="text-gray-600">Wood: {enquiry.woodType}</div>
                                )}
                                <div className="text-gray-500">
                                  {enquiry.numberOfLogs} logs • {enquiry.cubicFeet} cu ft
                                </div>
                              </>
                            )}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewEnquiry(enquiry)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
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

      {/* Detailed Enquiry Modal */}
      {showModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Enquiry Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information */}
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
                    <p className="text-xs text-gray-500">Processing Category</p>
                    <p className="text-sm font-medium text-gray-900">{selectedEnquiry.workType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requested Date & Time</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedEnquiry.requestedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {selectedEnquiry.requestedTime}
                    </p>
                  </div>
                  {typeof selectedEnquiry.processingHours === 'number' && selectedEnquiry.processingHours > 0 && (
                    <div>
                      <p className="text-xs text-gray-500">Estimated Processing Time</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedEnquiry.processingHours} hour{selectedEnquiry.processingHours === 1 ? '' : 's'}
                      </p>
                    </div>
                  )}
                  {(selectedEnquiry.estimatedCost || selectedEnquiry.paymentStatus) && (
                    <div>
                      <p className="text-xs text-gray-500">Billing & Payment</p>
                      {selectedEnquiry.estimatedCost && (
                        <p className="text-sm font-medium text-gray-900">
                          Estimated: ₹{selectedEnquiry.estimatedCost.toLocaleString('en-IN')}
                        </p>
                      )}
                      {selectedEnquiry.paymentStatus && (
                        <p className="text-xs mt-1 text-gray-700">
                          Payment:{' '}
                          <span
                            className={
                              selectedEnquiry.paymentStatus === 'PAID'
                                ? 'font-semibold text-green-700'
                                : selectedEnquiry.paymentStatus === 'FAILED'
                                ? 'font-semibold text-red-600'
                                : 'font-semibold text-orange-600'
                            }
                          >
                            {selectedEnquiry.paymentStatus === 'PAID'
                              ? `Paid (${selectedEnquiry.paymentMethod === 'OFFLINE' ? 'Offline' : 'Online'})`
                              : selectedEnquiry.paymentStatus === 'FAILED'
                              ? 'Failed'
                              : 'Pending'}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Log Items Display */}
                {selectedEnquiry.logItems && selectedEnquiry.logItems.length > 0 ? (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Wood Log Entries ({selectedEnquiry.logItems.length})</h4>
                    <div className="space-y-3">
                      {selectedEnquiry.logItems.map((item, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-500">Wood Type</p>
                              <p className="font-medium text-gray-900">{item.woodType}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Number of Logs</p>
                              <p className="font-medium text-gray-900">{item.numberOfLogs}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Dimensions</p>
                              <p className="font-medium text-gray-900">
                                {item.thickness && item.width && item.length 
                                  ? `${item.thickness}" × ${item.width}" × ${item.length}"`
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Cubic Feet</p>
                              <p className="font-medium text-gray-900">{item.cubicFeet} cu ft</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Entry #{idx + 1}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Total Cubic Feet:</span>
                        <span className="text-base font-semibold text-gray-900">{selectedEnquiry.cubicFeet} cu ft</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Legacy format - single log entry */
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {selectedEnquiry.woodType && (
                      <div>
                        <p className="text-xs text-gray-500">Wood Type</p>
                        <p className="text-sm font-medium text-gray-900">{selectedEnquiry.woodType}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Number of Logs</p>
                      <p className="text-sm font-medium text-gray-900">{selectedEnquiry.numberOfLogs || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cubic Feet</p>
                      <p className="text-sm font-medium text-gray-900">{selectedEnquiry.cubicFeet} cu ft</p>
                    </div>
                  </div>
                )}
                {selectedEnquiry.notes && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Customer Notes</p>
                    <p className="text-sm text-gray-700 mt-1">{selectedEnquiry.notes}</p>
                  </div>
                )}
              </div>

              {/* Uploaded Images */}
              {selectedEnquiry.images && selectedEnquiry.images.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Uploaded Images</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedEnquiry.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={`Wood image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Decision Actions */}
              {(selectedEnquiry.status === 'ENQUIRY_RECEIVED' || selectedEnquiry.status === 'UNDER_REVIEW') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-3">Admin Decision</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={handleCheckAvailability}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Check Availability</span>
                    </button>
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
                      <span>Confirm Request</span>
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

              {/* Status & Payment Management */}
              {(selectedEnquiry.status === 'SCHEDULED' || selectedEnquiry.status === 'TIME_ACCEPTED') && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-900 mb-3">Service Lifecycle & Payment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('IN_PROGRESS')}
                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Mark as In Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('COMPLETED')}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark as Completed
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-green-900 font-medium">Payment Controls</p>
                      {selectedEnquiry.paymentStatus !== 'PAID' ? (
                        <>
                          <p className="text-xs text-green-800">
                            Customer can pay online once the request is confirmed. Use this option if they pay offline
                            at the mill.
                          </p>
                          <button
                            type="button"
                            onClick={async () => {
                              const note = window.prompt('Add an optional note for this offline payment (e.g., receipt no.):', '');
                              if (note === null) return;
                              try {
                                setLoading(true);
                                await axios.post(`/services/admin/enquiries/${selectedEnquiry._id}/payments/offline/mark-paid`, {
                                  note,
                                });
                                fetchEnquiries();
                                showSuccess('Offline payment marked as received');
                              } catch (err) {
                                console.error('Error marking offline payment:', err);
                                showError(err.response?.data?.message || 'Failed to mark offline payment');
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="w-full px-4 py-3 bg-dark-brown text-white rounded-lg hover:bg-accent-red transition-colors"
                          >
                            Mark Offline Payment as Received
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-green-800">
                          Payment received ({selectedEnquiry.paymentMethod === 'OFFLINE' ? 'Offline' : 'Online'}).
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedEnquiry.status === 'IN_PROGRESS' && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-indigo-900 mb-3">Service Lifecycle</h3>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('COMPLETED')}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                </div>
              )}

              {/* Admin Notes */}
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

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await axios.put(`/services/admin/enquiries/${selectedEnquiry._id}`, {
                        adminNotes: updateData.adminNotes,
                      });
                      setShowModal(false);
                      fetchEnquiries();
                      showSuccess('Notes updated successfully');
                    } catch (err) {
                      showError('Failed to update notes');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Time Modal */}
      {showAcceptModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Confirm Request</h2>
            </div>

            <form onSubmit={handleAcceptRequestedTime} className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900 mb-2">
                  <strong>Customer Requested:</strong>
                </p>
                <p className="text-sm text-green-800">
                  {new Date(selectedEnquiry.requestedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-green-800 mt-1">
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
                  placeholder="Add a confirmation message for the customer..."
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
                  {loading ? 'Confirming...' : 'Confirm Request'}
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

      {/* Availability Check Modal */}
      {showAvailabilityModal && availabilityData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Availability Check</h2>
            </div>
            <div className="p-6">
              {availabilityData.available ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-green-900">Time Slot Available</p>
                  </div>
                  <p className="text-sm text-green-800">{availabilityData.message}</p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p className="text-sm font-medium text-red-900">Time Slot Not Available</p>
                  </div>
                  <p className="text-sm text-red-800">{availabilityData.reason}</p>
                  {availabilityData.conflicts && availabilityData.conflicts.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-red-900 mb-1">Conflicting Bookings:</p>
                      {availabilityData.conflicts.map((conflict, idx) => (
                        <p key={idx} className="text-xs text-red-700">
                          {conflict.startTime} - {conflict.endTime}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Management Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Manage Holidays</h2>
              <button
                onClick={() => {
                  setShowHolidayModal(false);
                  setHolidayData({ date: '', name: '', description: '', isRecurring: false });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Create Holiday Form */}
              <form onSubmit={handleCreateHoliday} className="space-y-4 border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900">Add New Holiday</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={holidayData.date}
                      onChange={(e) => setHolidayData({ ...holidayData, date: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Holiday Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={holidayData.name}
                      onChange={(e) => setHolidayData({ ...holidayData, name: e.target.value })}
                      required
                      placeholder="e.g., New Year"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={holidayData.description}
                    onChange={(e) => setHolidayData({ ...holidayData, description: e.target.value })}
                    rows="2"
                    placeholder="Optional description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={holidayData.isRecurring}
                    onChange={(e) => setHolidayData({ ...holidayData, isRecurring: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Recurring holiday (yearly)</label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Adding...' : 'Add Holiday'}
                </button>
              </form>

              {/* Holidays List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Holidays</h3>
                {holidays.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No holidays added yet</p>
                ) : (
                  <div className="space-y-2">
                    {holidays.map((holiday) => (
                      <div
                        key={holiday._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{holiday.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(holiday.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            {holiday.isRecurring && (
                              <span className="ml-2 text-blue-600">(Recurring)</span>
                            )}
                          </p>
                          {holiday.description && (
                            <p className="text-xs text-gray-400 mt-1">{holiday.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteHoliday(holiday._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
