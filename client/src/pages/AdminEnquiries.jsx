import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNotification } from '../components/NotificationProvider';

export default function AdminEnquiries() {
    const { showSuccess, showError } = useNotification();
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    // Quote form state
    const [quotePrice, setQuotePrice] = useState('');
    const [quoteTime, setQuoteTime] = useState('');
    const [quoteNotes, setQuoteNotes] = useState('');

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/enquiries');
            setEnquiries(Array.isArray(res.data) ? res.data : (res.data.enquiries || []));
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to fetch enquiries');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/admin/enquiries/${id}`, { status });
            showSuccess(`Status updated to ${status}`);
            fetchEnquiries();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleSendQuote = async (e) => {
        e.preventDefault();
        if (!selectedEnquiry) return;
        try {
            await api.put(`/admin/enquiries/${selectedEnquiry._id}`, {
                quote: {
                    price: Number(quotePrice),
                    estimatedProductionTime: quoteTime,
                    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for 7 days
                    notes: quoteNotes
                },
                status: 'Quoted'
            });
            showSuccess('Quote sent successfully');
            setSelectedEnquiry(null);
            fetchEnquiries();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to send quote');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Custom Furniture Enquiries</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Manage made-to-order requests and custom custom furniture projects.
                </p>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {enquiries.length === 0 ? (
                        <li className="px-6 py-12 text-center text-gray-500">No enquiries found.</li>
                    ) : (
                        enquiries.map((enquiry) => (
                            <li key={enquiry._id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div className="flex flex-col mb-4 sm:mb-0">
                                        <p className="text-sm font-medium text-green-600 truncate">
                                            {enquiry.product ? `Made-to-Order: ${enquiry.product.name}` : 'Custom Project Request'}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            From: {enquiry.contactName} ({enquiry.contactEmail})
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Submitted: {new Date(enquiry.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${enquiry.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                enquiry.status === 'Quoted' ? 'bg-blue-100 text-blue-800' :
                                                    enquiry.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                        enquiry.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {enquiry.status}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setSelectedEnquiry(enquiry);
                                                setQuotePrice(enquiry.quote?.price || '');
                                                setQuoteTime(enquiry.quote?.estimatedProductionTime || '');
                                                setQuoteNotes(enquiry.quote?.notes || '');
                                            }}
                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                        >
                                            View / Quote
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Quote Modal */}
            {selectedEnquiry && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedEnquiry(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Enquiry Details
                                </h3>
                                <div className="mt-4 border-t border-gray-200 pt-4">
                                    <p className="text-sm text-gray-500"><strong>Customer:</strong> {selectedEnquiry.contactName} ({selectedEnquiry.contactPhone})</p>
                                    <p className="text-sm text-gray-500 mt-2"><strong>Message:</strong> {selectedEnquiry.message}</p>

                                    {selectedEnquiry.selectedOptions && Object.keys(selectedEnquiry.selectedOptions).length > 0 && (
                                        <div className="mt-2 text-sm text-gray-500">
                                            <strong>Preferences:</strong>
                                            <ul className="list-disc pl-5 mt-1">
                                                {Object.entries(selectedEnquiry.selectedOptions).map(([key, value]) => (
                                                    <li key={key} className="capitalize">{key}: {value}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {selectedEnquiry.customImages && selectedEnquiry.customImages.length > 0 && (
                                        <div className="mt-3 grid grid-cols-3 gap-2">
                                            {selectedEnquiry.customImages.map((img, idx) => (
                                                <img key={idx} src={img.url || img.data} alt="Custom request" className="h-20 w-full object-cover rounded-md" />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSendQuote} className="mt-5 border-t border-gray-200 pt-5">
                                    <h4 className="text-md font-medium text-gray-900 mb-3">Provide a Quote</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Total Price Quote (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                value={quotePrice}
                                                onChange={(e) => setQuotePrice(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Estimated Production Time</label>
                                            <input
                                                type="text"
                                                required
                                                value={quoteTime}
                                                onChange={(e) => setQuoteTime(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                placeholder="e.g. 3-4 weeks"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Notes / Conditions</label>
                                            <textarea
                                                rows={3}
                                                value={quoteNotes}
                                                onChange={(e) => setQuoteNotes(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:col-start-2 sm:text-sm"
                                        >
                                            Send Quote
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedEnquiry(null)}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    {['Pending', 'Quoted'].includes(selectedEnquiry.status) && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateStatus(selectedEnquiry._id, 'Rejected')}
                                                className="w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none sm:text-sm"
                                            >
                                                Reject Enquiry
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
