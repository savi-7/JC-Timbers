import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import dashboardImg from '../assets/dashboard.png';

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream">
      <Header backgroundClass=''/>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-heading text-dark-brown leading-tight mb-6">
            <span className="text-7xl md:text-8xl">A</span>bout <span className="text-7xl md:text-8xl">U</span>s
          </h1>
          <p className="text-dark-brown text-xl font-paragraph max-w-3xl mx-auto">
            Discover the story behind JC Timbers - your trusted partner for premium timber products, 
            handcrafted furniture, and quality construction materials.
          </p>
        </div>

        {/* Main About Content */}
        <div className="grid md:grid-cols-2 gap-16 items-start mb-16">
          {/* Left Column - Image */}
          <div className="space-y-6">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Cozy living room with rustic furniture showcasing JC Timbers craftsmanship"
                className="w-full h-[500px] object-cover rounded-lg shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-brown/20 to-transparent rounded-lg"></div>
            </div>
          </div>

          {/* Right Column - Story */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-heading text-dark-brown mb-6">Our Story</h2>
              <div className="space-y-6 text-lg leading-relaxed font-paragraph text-dark-brown">
                <p>
                  JC Timbers is a family-owned business dedicated to delivering the finest timber and furniture products in India. 
                  With over 20 years of experience, we blend traditional craftsmanship with modern design, ensuring every piece is 
                  both beautiful and durable.
                </p>
                <p>
                  Our commitment to sustainability means we source our materials responsibly, supporting local communities and 
                  the environment. From custom furniture to construction timber, we take pride in our attention to detail and 
                  customer satisfaction.
                </p>
                <p>
                  Join us on our journey to create spaces that inspire and endure. Every project we undertake reflects our 
                  passion for quality and our dedication to bringing your vision to life.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-4xl font-heading text-dark-brown text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading text-dark-brown mb-3">Quality First</h3>
              <p className="text-gray-600 font-paragraph">
                We never compromise on quality. Every piece is crafted with precision and attention to detail.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading text-dark-brown mb-3">Sustainability</h3>
              <p className="text-gray-600 font-paragraph">
                Committed to responsible sourcing and environmental stewardship in all our operations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading text-dark-brown mb-3">Customer Focus</h3>
              <p className="text-gray-600 font-paragraph">
                Your satisfaction is our priority. We work closely with you to bring your vision to life.
              </p>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
          <div>
            <h2 className="text-4xl font-heading text-dark-brown mb-6">20+ Years of Excellence</h2>
            <div className="space-y-6 text-lg leading-relaxed font-paragraph text-dark-brown">
              <p>
                Since our founding, JC Timbers has grown from a small family workshop to a trusted name in the timber 
                and furniture industry. Our journey has been marked by continuous learning, innovation, and an unwavering 
                commitment to excellence.
              </p>
              <p>
                We've had the privilege of working with thousands of satisfied customers, from individual homeowners 
                creating their dream spaces to large construction companies building the future. Each project has 
                taught us something new and helped us refine our craft.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-red">1000+</div>
                  <div className="text-sm text-gray-600 font-paragraph">Projects Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-red">500+</div>
                  <div className="text-sm text-gray-600 font-paragraph">Happy Customers</div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src={dashboardImg}
              alt="Craftsman working on timber furniture"
              className="w-full h-[400px] object-cover rounded-lg shadow-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-brown/30 to-transparent rounded-lg"></div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-dark-brown to-accent-red rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-heading mb-6">Ready to Start Your Project?</h2>
          <p className="text-xl font-paragraph mb-8 max-w-2xl mx-auto">
            Let us help you bring your vision to life with our premium timber products and expert craftsmanship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/timber-products')}
              className="bg-white text-dark-brown px-8 py-4 rounded-lg font-paragraph hover:bg-cream transition-colors duration-200 text-lg"
            >
              Browse Products
            </button>
            <button
              onClick={() => navigate('/contact-us', { scroll: true })}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-paragraph hover:bg-white hover:text-dark-brown transition-colors duration-200 text-lg"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
