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

  // Lazy-load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayOnline = async (enquiry) => {
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert('Failed to load payment system. Please check your internet connection and try again.');
        return;
      }

      // Create Razorpay order for this service enquiry
      const orderRes = await axios.post(`/services/enquiries/${enquiry._id}/payments/razorpay/order`);
      const { orderId, amount, currency, keyId, customer } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'JC Timbers - Timber Processing',
        description: `Service enquiry ${enquiry._id}`,
        order_id: orderId,
        prefill: {
          name: customer?.name || '',
          email: customer?.email || '',
          contact: customer?.phone || '',
        },
        handler: async function (response) {
          try {
            await axios.post(`/services/enquiries/${enquiry._id}/payments/razorpay/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert('Payment successful! Your payment status has been updated.');
            fetchEnquiries();
          } catch (err) {
            console.error('Error verifying payment:', err);
            alert('Payment verification failed. Please contact support with your payment details.');
          }
        },
        theme: {
          color: '#5b3427',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error initiating payment:', err);
      alert(err.response?.data?.message || 'Failed to start payment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
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
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-dark-brown">My Service Enquiries</h1>
                <p className="text-gray-600 mt-1">Track your service requests</p>
              </div>
              <button
                onClick={() => navigate('/services/enquiry')}
                className="px-6 py-3 bg-dark-brown text-white rounded-lg hover:bg-accent-red transition-colors font-paragraph"
              >
                + New Enquiry
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-dark-brown">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent"
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
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-dark-brown border-t-transparent"></div>
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
                className="text-accent-red hover:text-dark-brown font-medium transition-colors"
              >
                Submit your first enquiry →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enquiry) => (
                <div key={enquiry._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-accent-red/30 transition-all">
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
                      <h3 className="text-lg font-heading font-semibold text-dark-brown mb-2">
                        {enquiry.workType} Service
                      </h3>

                      {/* Log Items Display */}
                      {enquiry.logItems && enquiry.logItems.length > 0 ? (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">Wood Log Entries:</p>
                          <div className="space-y-2">
                            {enquiry.logItems.map((item, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs text-gray-500">Wood Type</p>
                                    <p className="font-medium text-dark-brown">{item.woodType}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Number of Logs</p>
                                    <p className="font-medium text-dark-brown">{item.numberOfLogs}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Dimensions</p>
                                    <p className="font-medium text-dark-brown">
                                      {item.thickness && item.width && item.length 
                                        ? `${item.thickness}" × ${item.width}" × ${item.length}"`
                                        : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Cubic Feet</p>
                                    <p className="font-medium text-dark-brown">{item.cubicFeet}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-2 bg-dark-brown/5 border border-dark-brown/20 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-dark-brown">Total Cubic Feet:</span>
                              <span className="text-base font-semibold text-dark-brown">{enquiry.cubicFeet} cu ft</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Legacy format - single log entry */
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Wood Type</p>
                            <p className="text-sm font-medium text-dark-brown">{enquiry.woodType || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Number of Logs</p>
                            <p className="text-sm font-medium text-dark-brown">{enquiry.numberOfLogs || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Cubic Feet</p>
                            <p className="text-sm font-medium text-dark-brown">{enquiry.cubicFeet}</p>
                          </div>
                        </div>
                      )}

                      {/* Requested Date & Time */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Requested Date</p>
                          <p className="text-sm font-medium text-dark-brown">
                            {new Date(enquiry.requestedDate).toLocaleDateString('en-US')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Requested Time</p>
                          <p className="text-sm font-medium text-dark-brown">{enquiry.requestedTime}</p>
                        </div>
                        {typeof enquiry.processingHours === 'number' && enquiry.processingHours > 0 && (
                          <div>
                            <p className="text-xs text-gray-500">Estimated Processing Time</p>
                            <p className="text-sm font-medium text-dark-brown">
                              {enquiry.processingHours} hour{enquiry.processingHours === 1 ? '' : 's'}
                            </p>
                          </div>
                        )}
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

                      {/* Estimated Cost & Payment Status */}
                      {(enquiry.estimatedCost || enquiry.paymentStatus) && (
                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          {enquiry.estimatedCost && (
                            <p className="text-sm text-gray-600">
                              Estimated Cost:{' '}
                              <span className="font-semibold text-dark-brown">
                                ₹{enquiry.estimatedCost.toLocaleString('en-IN')}
                              </span>
                            </p>
                          )}
                          {enquiry.paymentStatus && (
                            <p className="text-xs sm:text-sm text-gray-600">
                              Payment Status:{' '}
                              <span
                                className={
                                  enquiry.paymentStatus === 'PAID'
                                    ? 'font-semibold text-green-700'
                                    : enquiry.paymentStatus === 'FAILED'
                                    ? 'font-semibold text-red-600'
                                    : 'font-semibold text-orange-600'
                                }
                              >
                                {enquiry.paymentStatus === 'PAID'
                                  ? `Paid (${enquiry.paymentMethod === 'OFFLINE' ? 'Offline' : 'Online'})`
                                  : enquiry.paymentStatus === 'FAILED'
                                  ? 'Failed'
                                  : 'Pending'}
                              </span>
                            </p>
                          )}
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
                    <div className="ml-4 flex flex-col gap-2 items-end">
                      {(enquiry.status === 'ENQUIRY_RECEIVED' || enquiry.status === 'UNDER_REVIEW') && (
                        <button
                          onClick={() => handleCancelEnquiry(enquiry._id)}
                          className="px-4 py-2 text-sm font-paragraph text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors border border-accent-red/30 hover:border-accent-red"
                        >
                          Cancel
                        </button>
                      )}

                      {/* Pay Now becomes available after admin accepts/ schedules and while payment is pending */}
                      {enquiry.estimatedCost &&
                        enquiry.paymentStatus !== 'PAID' &&
                        (enquiry.status === 'TIME_ACCEPTED' || enquiry.status === 'SCHEDULED') && (
                          <button
                            onClick={() => handlePayOnline(enquiry)}
                            className="px-4 py-2 text-sm font-paragraph bg-dark-brown text-white rounded-lg hover:bg-accent-red transition-colors"
                          >
                            Pay Online (Razorpay)
                          </button>
                        )}

                      {enquiry.paymentMethod === 'OFFLINE' && enquiry.paymentStatus === 'PAID' && enquiry.offlinePaymentNote && (
                        <p className="text-[10px] text-gray-500 max-w-[160px] text-right">
                          Offline payment note: {enquiry.offlinePaymentNote}
                        </p>
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
