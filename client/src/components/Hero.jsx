import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import dashboardImg from "../assets/dashboard.png"; // Corrected import name

export default function Hero() {
  const navigate = useNavigate();
  const [showShopDropdown, setShowShopDropdown] = useState(false);

  // Click outside handler for shop dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShopDropdown && !event.target.closest('.shop-dropdown')) {
        setShowShopDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShopDropdown]);

  return (
    <section className="relative">
      {/* Navigation Header */}
      <nav className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left - Brand Name */}
            <div className="text-xl font-paragraph text-dark-brown tracking-wide">
              JC Timbers
            </div>
            
            {/* Center - Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="relative shop-dropdown">
                <button 
                  onClick={() => setShowShopDropdown(!showShopDropdown)}
                  className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph flex items-center gap-1"
                >
                  Shop All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showShopDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button 
                      onClick={() => { navigate('/timber-products'); setShowShopDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream"
                    >
                      Timber Products
                    </button>
                    <button 
                      onClick={() => { navigate('/furniture'); setShowShopDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream"
                    >
                      Furniture
                    </button>
                    <button 
                      onClick={() => { navigate('/construction-materials'); setShowShopDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-dark-brown hover:bg-cream"
                    >
                      Construction Products
                    </button>
                  </div>
                )}
              </div>
              <button className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph">
                About
              </button>
              <button className="text-dark-brown hover:text-accent-red transition-colors duration-200 font-paragraph">
                Contact
              </button>
            </div>
            
            {/* Right - Login and Cart */}
            <div className="flex items-center space-x-4">
              {/* Login Icon */}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="cursor-pointer p-2 rounded-full hover:bg-cream focus:outline-none focus:ring-2 focus:ring-accent-red"
                aria-label="Profile / Login"
                title="Profile / Login"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-6 h-6 text-dark-brown hover:text-accent-red transition-colors duration-200"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  <path d="M4.5 19.5a7.5 7.5 0 0115 0" />
                </svg>
              </button>
              
              {/* Cart Icon */}
              <button
                onClick={() => navigate('/cart')}
                className="cursor-pointer relative group"
                aria-label="Shopping Cart"
                title="Shopping Cart"
              >
                <svg className="w-6 h-6 text-dark-brown group-hover:text-accent-red transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {/* Cart basket */}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h14l-1 8H5L4 6z" />
                  {/* Cart handle */}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 6v-2a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2" />
                  {/* Front wheel */}
                  <circle cx="6" cy="18" r="2" strokeWidth={1.5} />
                  {/* Rear wheel */}
                  <circle cx="16" cy="18" r="2.5" strokeWidth={1.5} />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Hero Content */}
      <div className="bg-cream py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-heading text-dark-brown mb-8 leading-tight">
              JC Timbers
            </h1>
          </div>

          {/* Hero Image */}
          <div className="mb-12">
            <div className="relative bg-white rounded-lg shadow-lg overflow-hidden w-full">
              <img
                src={dashboardImg}
                alt="Living room"
                className="w-full h-[426px] object-cover"
                style={{ minWidth: 0, maxWidth: "100%" }}
                fetchpriority="high"
              />
            </div>
          </div>

          {/* Description and CTA */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <p className="text-dark-brown text-lg leading-relaxed max-w-2xl font-paragraph">
                Discover handcrafted rustic furniture that brings a warm touch to your home. 
                Explore our unique designs and sustainable sourcing to create a cozy and inviting atmosphere.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button className="bg-accent-red hover:bg-dark-brown text-white px-8 py-3 rounded-lg font-paragraph transition-colors duration-200">
                Explore Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
