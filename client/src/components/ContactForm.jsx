import React, { useState } from 'react';
import { useNotification } from './NotificationProvider';
import api from '../api/axios';

export default function ContactForm() {
  const { showSuccess, showError } = useNotification();
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
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showError(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact-form" className="bg-cream py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/50" />
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-20">
        
        {/* Left Side: Editorial Header */}
        <div className="lg:w-1/3 space-y-8">
          <h2 className="text-6xl md:text-8xl font-heading text-dark-brown leading-none tracking-tighter">
            Get in<br/>
            <span className="italic text-accent-red font-light">touch</span>
          </h2>
          <p className="text-xl font-paragraph text-dark-brown/60 leading-relaxed max-w-sm">
            Have a project in mind or just want to say hello? We'd love to hear from you.
          </p>
          <div className="pt-8 space-y-6">
            <div className="font-paragraph text-dark-brown">
              <span className="block text-xs font-bold text-dark-brown/50 uppercase tracking-widest mb-1">Email</span>
              <a href="mailto:hello@jctimbers.com" className="text-xl hover:text-accent-red transition-colors duration-300">hello@jctimbers.com</a>
            </div>
            <div className="font-paragraph text-dark-brown">
              <span className="block text-xs font-bold text-dark-brown/50 uppercase tracking-widest mb-1">Phone</span>
              <a href="tel:+919876543210" className="text-xl hover:text-accent-red transition-colors duration-300">+91 98765 43210</a>
            </div>
          </div>
        </div>

        {/* Right Side: Ultra Minimalist Form */}
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="relative group">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="peer w-full bg-transparent border-b border-dark-brown/20 focus:border-accent-red py-4 text-2xl font-heading text-dark-brown outline-none transition-colors duration-300 placeholder-transparent"
                  placeholder="Name"
                />
                <label htmlFor="name" className="absolute left-0 top-4 text-dark-brown/40 font-heading text-2xl transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent-red peer-valid:-top-6 peer-valid:text-xs peer-valid:text-dark-brown/40 pointer-events-none uppercase tracking-widest">
                  Name
                </label>
              </div>

              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="peer w-full bg-transparent border-b border-dark-brown/20 focus:border-accent-red py-4 text-2xl font-heading text-dark-brown outline-none transition-colors duration-300 placeholder-transparent"
                  placeholder="Email"
                />
                <label htmlFor="email" className="absolute left-0 top-4 text-dark-brown/40 font-heading text-2xl transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent-red peer-valid:-top-6 peer-valid:text-xs peer-valid:text-dark-brown/40 pointer-events-none uppercase tracking-widest">
                  Email
                </label>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="relative group flex items-end">
                <div className="border-b border-dark-brown/20 focus-within:border-accent-red transition-colors duration-300 pb-4 pr-4">
                   <select className="bg-transparent border-none outline-none text-dark-brown/60 font-heading text-xl cursor-pointer">
                     <option value="+91">IN (+91)</option>
                     <option value="+1">US (+1)</option>
                     <option value="+44">UK (+44)</option>
                   </select>
                </div>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="peer w-full bg-transparent border-b border-dark-brown/20 focus:border-accent-red py-4 text-2xl font-heading text-dark-brown outline-none transition-colors duration-300 placeholder-transparent"
                    placeholder="Phone"
                  />
                  <label htmlFor="phone" className="absolute left-0 top-4 text-dark-brown/40 font-heading text-2xl transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent-red peer-valid:-top-6 peer-valid:text-xs peer-valid:text-dark-brown/40 pointer-events-none uppercase tracking-widest">
                    Phone
                  </label>
                </div>
              </div>

              <div className="relative group">
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="peer w-full bg-transparent border-b border-dark-brown/20 focus:border-accent-red py-4 text-2xl font-heading text-dark-brown outline-none transition-colors duration-300 placeholder-transparent"
                  placeholder="Subject"
                />
                <label htmlFor="subject" className="absolute left-0 top-4 text-dark-brown/40 font-heading text-2xl transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent-red peer-valid:-top-6 peer-valid:text-xs peer-valid:text-dark-brown/40 pointer-events-none uppercase tracking-widest">
                  Subject
                </label>
              </div>
            </div>

            {/* Row 3 Message */}
            <div className="relative group pt-6">
              <textarea
                name="message"
                id="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={4}
                className="peer w-full bg-transparent border-b border-dark-brown/20 focus:border-accent-red py-4 text-2xl font-heading text-dark-brown outline-none transition-colors duration-300 placeholder-transparent resize-none"
                placeholder="Message"
              />
              <label htmlFor="message" className="absolute left-0 top-10 text-dark-brown/40 font-heading text-2xl transition-all duration-300 peer-focus:top-0 peer-focus:text-xs peer-focus:text-accent-red peer-valid:top-0 peer-valid:text-xs peer-valid:text-dark-brown/40 pointer-events-none uppercase tracking-widest">
                Your Message
              </label>
            </div>

            {/* Submit */}
            <div className="pt-8 md:text-right">
              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex items-center justify-center gap-4 bg-transparent text-dark-brown hover:text-accent-red py-4 font-paragraph text-xl tracking-widest uppercase transition-colors duration-500 disabled:opacity-50"
              >
                <span className="relative z-10">{loading ? 'Sending...' : 'Send Message'}</span>
                {!loading && (
                  <span className="w-12 h-[1px] bg-dark-brown group-hover:bg-accent-red group-hover:w-16 transition-all duration-300" />
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
}
