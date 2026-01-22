import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ServicePage() {
  const navigate = useNavigate();

  const services = [
    {
      id: "timber-processing",
      title: "Timber Cutting & Processing",
      description: "Professional timber cutting, planing, resawing, and debarking services. Get your wood processed exactly as you need it.",
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      features: [
        "Planing - Smooth and finish wood surfaces",
        "Resawing - Cut large logs into smaller pieces",
        "Debarking - Remove bark from logs",
        "Sawing - Custom cutting to your specifications",
        "Other processing services as needed"
      ],
      action: () => navigate("/services/timber-processing"),
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      <main className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-cream to-light-cream py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl lg:text-5xl font-heading text-dark-brown mb-4">
              Our Services
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional timber processing and woodworking services tailored to your needs
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  {/* Icon */}
                  <div className="text-accent-red mb-6 flex justify-center">
                    {service.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-heading text-dark-brown mb-4 text-center">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 text-center min-h-[48px]">
                    {service.description}
                  </p>

                  {/* Features List */}
                  {service.features && (
                    <ul className="mb-6 space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={service.action}
                    className="w-full bg-dark-brown text-white px-6 py-3 rounded-lg font-paragraph hover:bg-accent-red transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Send a Request
                  </button>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-start gap-3 px-6 py-4 bg-blue-50 rounded-lg border border-blue-200 max-w-3xl">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900 mb-1">How It Works</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Fill out the service request form with your requirements</li>
                    <li>• Our team reviews your request within 24 hours</li>
                    <li>• We confirm your preferred time slot or propose an alternative</li>
                    <li>• Your wood is processed on the scheduled date</li>
                    <li>• Service completed and ready for pickup</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Working Hours:</span> Monday - Saturday, 9:00 AM - 5:00 PM
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
