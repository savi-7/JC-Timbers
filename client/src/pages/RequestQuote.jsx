import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RequestQuote() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const product = state?.product;

    const [message, setMessage] = useState('');
    const [selectedOptions, setSelectedOptions] = useState({
        woodType: '',
        dimensions: ''
    });
    const [contactDetails, setContactDetails] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Initial redirect if no product or not logged in
    if (!isAuthenticated) {
        localStorage.setItem('loginRedirect', '/furniture/request-quote');
        localStorage.setItem('pendingQuoteProduct', JSON.stringify(product));
        navigate('/login');
        return null;
    }

    if (!product) {
        navigate('/furniture');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!contactDetails.name || !contactDetails.email || !contactDetails.phone) {
            setError('Please provide all contact details (name, email, phone)');
            return;
        }

        if (!message.trim()) {
            setError('Please provide some details about your request');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');

            await api.post('/enquiries', {
                productId: product._id,
                enquiryType: 'made-to-order',
                contactName: contactDetails.name,
                contactEmail: contactDetails.email,
                contactPhone: contactDetails.phone,
                customDescription: message,
                selectedOptions
            });

            // Redirect to enquires page on success
            navigate('/my-enquiries', { replace: true });
        } catch (err) {
            console.error('Submit quote request failed:', err);
            setError(err.response?.data?.message || 'Failed to submit quote request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangeOption = (field, value) => {
        setSelectedOptions(prev => ({ ...prev, [field]: value }));
    };

    const getImageUrl = (image) => {
        const fallback = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=No+Image';
        if (!image) return fallback;
        if (image.url) return image.url;
        if (image.data) {
            if (image.data.startsWith('data:') || image.data.startsWith('http')) return image.data;
            return `data:${image.contentType || 'image/jpeg'};base64,${image.data}`;
        }
        return fallback;
    };

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Header />

            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-dark-brown transition-colors mb-4"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Product
                    </button>
                    <h1 className="text-3xl font-bold text-dark-brown font-heading">Request Custom Quote</h1>
                    <p className="mt-2 text-gray-600">Customize this made-to-order product and get a tailored quote.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-5 bg-gray-50 border-b border-gray-100 p-6 gap-6 items-center">
                        <div className="md:col-span-1 rounded-lg overflow-hidden aspect-square border-2 border-white shadow-sm">
                            <img
                                src={getImageUrl(product.images?.[0])}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="md:col-span-4">
                            <h2 className="text-xl font-bold text-dark-brown">{product.name}</h2>
                            <p className="text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                            {product.customizationOptions?.woodTypes?.length > 0 && (
                                <p className="text-sm text-gray-500 mt-2">
                                    <span className="font-medium">Available woods:</span> {product.customizationOptions.woodTypes.join(', ')}
                                </p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {product.customizationOptions && product.customizationOptions.woodTypes && product.customizationOptions.woodTypes.length > 0 && (
                                <div>
                                    <label htmlFor="woodType" className="block text-sm font-medium text-gray-700 mb-1">
                                        Preferred Wood Type
                                    </label>
                                    <select
                                        id="woodType"
                                        value={selectedOptions.woodType}
                                        onChange={(e) => handleChangeOption('woodType', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent-red focus:border-accent-red transition-colors"
                                    >
                                        <option value="">Select Wood Type</option>
                                        {product.customizationOptions.woodTypes.map(wood => (
                                            <option key={wood} value={wood}>{wood}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-1">
                                    Custom Dimensions (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="dimensions"
                                    placeholder="e.g. 120cm x 60cm x 75cm"
                                    value={selectedOptions.dimensions}
                                    onChange={(e) => handleChangeOption('dimensions', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent-red focus:border-accent-red transition-colors"
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold text-dark-brown mb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                    <input type="text" required value={contactDetails.name} onChange={(e) => setContactDetails({ ...contactDetails, name: e.target.value })} className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-accent-red focus:border-accent-red" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                    <input type="email" required value={contactDetails.email} onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })} className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-accent-red focus:border-accent-red" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                                    <input type="tel" required value={contactDetails.phone} onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })} className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-accent-red focus:border-accent-red" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                Details & Specific Requirements <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                rows="5"
                                required
                                placeholder="Describe any specific design changes, finishes, or details you want for this piece..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent-red focus:border-accent-red transition-colors"
                            ></textarea>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 mr-4 text-gray-600 font-medium hover:text-dark-brown transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-8 py-3 bg-dark-brown text-white font-medium rounded-lg hover:bg-accent-red transition-colors shadow-md hover:shadow-lg flex items-center justify-center min-w-[200px] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Request'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
