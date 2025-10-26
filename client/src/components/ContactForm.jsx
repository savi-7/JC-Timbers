import React, { useState } from 'react';
import { useNotification } from './NotificationProvider';
import api from '../api/axios';

export default function ContactForm() {
  const { showSuccess, showError } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/contacts', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        category: 'general'
      });

      showSuccess(response.data.message || 'Thank you for your message! We\'ll get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showError(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact-form" className="bg-cream py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-7xl md:text-8xl font-heading text-dark-brown mb-6" style={{ fontWeight: 100 }}>
            Get in Touch
          </h2>
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-xl font-semibold text-dark-brown mb-4 hover:text-accent-red transition-colors duration-200 cursor-pointer"
            >
              Drop Us a Message
            </button>
            <p className="text-gray-700 font-paragraph leading-relaxed">
              Have a question or feedback? We'd love to hear from you. Click above to fill out the form, 
              and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>

        {/* Contact Form - Only shows when showForm is true */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-dark-brown focus:outline-none transition-colors duration-200 bg-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-dark-brown focus:outline-none transition-colors duration-200 bg-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Phone Row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <div className="flex items-center">
                  <div className="flex items-center border-b-2 border-gray-300 focus-within:border-dark-brown transition-colors duration-200">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <select className="bg-transparent border-none outline-none text-gray-700 pr-2">
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="flex-1 px-4 py-3 border-b-2 border-gray-300 focus:border-dark-brown focus:outline-none transition-colors duration-200 bg-transparent ml-2"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              {/* Subject Row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-dark-brown focus:outline-none transition-colors duration-200 bg-transparent"
                  placeholder="What's this about?"
                />
              </div>

              {/* Message Row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-dark-brown focus:outline-none transition-colors duration-200 bg-transparent resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-dark-brown text-white py-4 px-8 rounded-lg font-semibold hover:bg-accent-red transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  {loading ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
