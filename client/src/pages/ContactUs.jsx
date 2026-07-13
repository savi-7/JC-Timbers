import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading text-dark-brown mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-700 font-paragraph max-w-2xl mx-auto">
            Have questions about our products or services? We'd love to hear from you. 
            Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Phone */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading text-dark-brown mb-2">Phone</h3>
            <p className="text-gray-600 font-paragraph">+91 9447037716</p>
            <p className="text-sm text-gray-500 mt-1">Mon-Sat: 9AM - 6PM</p>
          </div>

          {/* Email */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading text-dark-brown mb-2">Email</h3>
            <p className="text-gray-600 font-paragraph">jctimbers@gmail.com</p>
            <p className="text-sm text-gray-500 mt-1">We reply within 24 hours</p>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading text-dark-brown mb-2">Location</h3>
            <p className="text-gray-600 font-paragraph">Koovappally, Kerala</p>
            <p className="text-sm text-gray-500 mt-1">Visit our showroom</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-4xl mx-auto">
          <ContactForm />
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-heading text-dark-brown mb-4 text-center">Business Hours</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h3 className="font-semibold text-dark-brown mb-2">Weekdays</h3>
              <p className="text-gray-600">Monday - Friday</p>
              <p className="text-gray-800 font-medium">9:00 AM - 6:00 PM</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-dark-brown mb-2">Weekend</h3>
              <p className="text-gray-600">Saturday</p>
              <p className="text-gray-800 font-medium">10:00 AM - 4:00 PM</p>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            Closed on Sundays and public holidays
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

