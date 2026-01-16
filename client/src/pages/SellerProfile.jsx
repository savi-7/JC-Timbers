import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';

export default function SellerProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const [sellerData, setSellerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSellerData();
    }
  }, [isAuthenticated, user]);

  const loadSellerData = () => {
    try {
      const data = localStorage.getItem(`seller_dashboard_${user.email}`);
      if (data) {
        setSellerData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading seller data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !isAuthenticated || isLoading) {
    return null;
  }

  if (!sellerData) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="bg-white">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <h3 className="font-heading text-lg text-dark-brown mb-2">Seller Dashboard Not Enabled</h3>
              <p className="text-sm text-gray-500 mb-4">
                Please enable seller dashboard first
              </p>
              <button
                onClick={() => navigate('/marketplace/enable-seller')}
                className="px-6 py-2.5 text-sm font-paragraph rounded-lg bg-accent-red text-white hover:bg-accent-red/90 transition-colors"
              >
                Enable Seller Dashboard
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="bg-white">
        <MarketplaceHeader
          userName={user?.name}
          userEmail={user?.email}
          onSearchChange={() => {}}
          onCategorySelect={() => {}}
          onSellClick={() => navigate('/marketplace/create-listing')}
        />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/marketplace/profile')}
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
            <span className="font-paragraph text-sm">Back to Profile</span>
          </button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="font-heading text-2xl text-dark-brown mb-2">Seller Profile</h1>
            <p className="text-sm text-gray-500">
              Your seller information and details
            </p>
          </div>

          {/* Profile Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Full Name
                </label>
                <p className="text-lg font-medium text-dark-brown">{sellerData.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email
                </label>
                <p className="text-lg font-medium text-dark-brown">{sellerData.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Phone Number
                </label>
                <p className="text-lg font-medium text-dark-brown">{sellerData.phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Location
                </label>
                <p className="text-lg font-medium text-dark-brown">{sellerData.location}</p>
              </div>
            </div>

            {/* Location Map */}
            {sellerData.locationCoords && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Location Map
                </label>
                <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${sellerData.locationCoords.lon - 0.1},${sellerData.locationCoords.lat - 0.1},${sellerData.locationCoords.lon + 0.1},${sellerData.locationCoords.lat + 0.1}&layer=mapnik&marker=${sellerData.locationCoords.lat},${sellerData.locationCoords.lon}`}
                    title="Location Map"
                    className="w-full h-full"
                  />
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${sellerData.locationCoords.lat}&mlon=${sellerData.locationCoords.lon}&zoom=12`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent-red hover:underline font-medium"
                    >
                      View on OpenStreetMap →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Enabled Date */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Seller Dashboard Enabled
              </label>
              <p className="text-sm text-gray-600">
                {sellerData.enabledAt
                  ? new Date(sellerData.enabledAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

