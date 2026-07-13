import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ServiceModule() {
  const navigate = useNavigate();
  const [showServices, setShowServices] = useState(false);

  const services = [
    {
      id: "timber-processing",
      title: "Timber Cutting & Processing",
      description: "Professional timber cutting, planing, resawing, and debarking services",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      action: () => navigate("/services/timber-processing"),
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-heading text-dark-brown mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional timber processing and woodworking services tailored to your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-gradient-to-br from-cream to-light-cream rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Icon */}
              <div className="text-accent-red mb-6 flex justify-center">
                {service.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-heading text-dark-brown mb-3 text-center">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm mb-6 text-center min-h-[48px]">
                {service.description}
              </p>

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
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 rounded-lg border border-blue-200">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800">
              All service requests are reviewed by our team. We'll contact you within 24 hours to confirm scheduling.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
