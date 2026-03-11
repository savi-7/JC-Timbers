import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MyFurnitureEnquiries() {
    const navigate = useNavigate();
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const res = await api.get('/enquiries/my');
            setEnquiries(Array.isArray(res.data) ? res.data : (res.data.enquiries || []));
        } catch (err) {
            console.error('Error fetching enquiries:', err);
            setError(err.response?.data?.message || 'Failed to fetch enquiries');
        } finally {
            setLoading(false);
        }
    };

    const formatINR = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const handleAcceptQuote = async (enquiry) => {
        try {
            // Mark enquiry as accepted first
            await api.put(`/enquiries/${enquiry._id}/accept`);

            // Navigate to checkout with the enquiry data
            navigate('/checkout', {
                state: {
                    isEnquiry: true,
                    enquiryData: {
                        id: enquiry._id,
                        productName: enquiry.product?.name || 'Custom Furniture',
                        total: enquiry.quote?.price || 0
                    }
                }
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to accept quote');
        }
    };

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Header />

            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-dark-brown font-heading">My Custom Requests</h1>
                    <p className="mt-2 text-gray-600">Track your custom furniture enquiries and quotes.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown"></div>
                    </div>
                ) : enquiries.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-100">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No custom requests yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            When you submit a request for made-to-order furniture, it will appear here.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/furniture')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-dark-brown hover:bg-accent-red"
                            >
                                Browse Furniture
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {enquiries.map((enquiry) => (
                            <div key={enquiry._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {enquiry.product ? `Enquiry for: ${enquiry.product.name}` : 'General Custom Request'}
                                        </h3>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                      ${enquiry.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                enquiry.status === 'Quoted' ? 'bg-blue-100 text-blue-800' :
                                                    enquiry.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                        enquiry.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                            }`}>
                                            {enquiry.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Your Request</h4>
                                            <div className="bg-gray-50 p-4 rounded-md">
                                                <p className="text-sm text-gray-600 mb-2">{enquiry.message}</p>
                                                {enquiry.selectedOptions && Object.keys(enquiry.selectedOptions).length > 0 && (
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        <strong>Preferences:</strong>
                                                        <ul className="list-disc pl-5 mt-1 space-y-1">
                                                            {Object.entries(enquiry.selectedOptions).map(([key, value]) => (
                                                                <li key={key} className="capitalize">{key}: {value}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-400 mt-3">Submitted on {new Date(enquiry.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Quote Details</h4>
                                            {enquiry.quote ? (
                                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-md">
                                                    <p className="text-2xl font-bold text-blue-900 mb-2">{formatINR(enquiry.quote.price)}</p>
                                                    <ul className="text-sm text-blue-800 space-y-2">
                                                        <li><strong>Est. Production Time:</strong> {enquiry.quote.estimatedProductionTime}</li>
                                                        {enquiry.quote.notes && <li><strong>Notes:</strong> {enquiry.quote.notes}</li>}
                                                        <li><strong>Valid Until:</strong> {new Date(enquiry.quote.validUntil).toLocaleDateString()}</li>
                                                    </ul>

                                                    {enquiry.status === 'Quoted' && (
                                                        <div className="mt-4 pt-4 border-t border-blue-200">
                                                            <button
                                                                onClick={() => handleAcceptQuote(enquiry)}
                                                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition font-medium"
                                                            >
                                                                Accept Quote & Pay Advance
                                                            </button>
                                                            <p className="text-xs text-blue-600 mt-2 text-center">
                                                                You can choose to pay 30% advance or full amount online on the next screen.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {enquiry.status === 'Accepted' && (
                                                        <div className="mt-4 pt-4 border-t border-blue-200">
                                                            <p className="text-sm font-medium text-green-700 text-center">
                                                                Quote Accepted. An order has been placed successfully!
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 p-4 rounded-md h-full flex items-center justify-center border border-dashed border-gray-300">
                                                    <p className="text-sm text-gray-500 text-center">
                                                        {enquiry.status === 'Rejected'
                                                            ? 'Unfortunately, we cannot fulfill this request at this time.'
                                                            : 'We are reviewing your request and will provide a quote soon.'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
