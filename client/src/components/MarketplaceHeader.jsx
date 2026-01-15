import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * MarketplaceHeader
 *
 * Reusable header for a marketplace-style page.
 *
 * Props:
 * - userName: string (logged-in user's name)
 * - userEmail: string (logged-in user's email)
 * - onSearchChange?: (value: string) => void
 * - onCategorySelect?: (category: string) => void
 * - onSellClick?: () => void   // called when Sell button is clicked (in addition to opening modal)
 */
const DEFAULT_CATEGORIES = [
  'Sofa',
  'Study Table',
  'Dining Table',
  'Bed',
  'Wardrobe',
  'Chair',
  'Coffee Table',
  'TV Unit',
  'Bookshelf',
  'Custom Furniture',
];

export default function MarketplaceHeader({
  userName,
  userEmail,
  onSearchChange,
  onCategorySelect,
  onSellClick,
}) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showCategoryDropdown &&
        !event.target.closest('.marketplace-category-dropdown')
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoryDropdown]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
    if (onCategorySelect) {
      onCategorySelect(category === 'All' ? '' : category);
    }
  };

  const handleSellClick = () => {
    navigate('/marketplace/create-listing');
    if (onSellClick) {
      onSellClick();
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand / Marketplace title */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dark-brown to-accent-red flex items-center justify-center text-white font-semibold text-lg">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg text-dark-brown leading-tight">
              Marketplace
            </span>
            <span className="text-xs text-gray-500 leading-tight">
              Discover and sell furniture
            </span>
          </div>
        </div>

        {/* Center: Search + Location */}
        <div className="flex-1 flex items-center gap-3 max-w-2xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              {/* Search icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search for furniture items (e.g. teak sofa, study table)..."
              className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/70 focus:border-accent-red placeholder:text-gray-400"
            />
          </div>

          {/* Location button (UI only) */}
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent-red/10 text-accent-red">
              {/* Location icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"
                />
                <circle cx="12" cy="11" r="2.5" />
              </svg>
            </span>
            <span className="hidden sm:inline font-paragraph text-xs sm:text-sm">
              Location
            </span>
          </button>
        </div>

        {/* Right: Sell button + Category button + Profile */}
        <div className="flex items-center gap-3">
          {/* Sell button - only show if user is logged in, otherwise show login button */}
          {userName ? (
            <button
              type="button"
              onClick={handleSellClick}
              className="inline-flex items-center gap-2 rounded-full bg-accent-red text-white px-4 py-1.5 text-sm font-paragraph shadow-sm hover:bg-accent-red/90 transition-colors"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10">
                +
              </span>
              <span>Sell</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-full bg-accent-red text-white px-4 py-1.5 text-sm font-paragraph shadow-sm hover:bg-accent-red/90 transition-colors"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10">
                +
              </span>
              <span>Sell</span>
            </button>
          )}

          {/* Category dropdown button */}
          <div className="relative marketplace-category-dropdown">
            <button
              type="button"
              onClick={() => setShowCategoryDropdown((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-paragraph text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h10m-6 6h6"
                />
              </svg>
              <span>Categories</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3 w-3 transition-transform ${
                  showCategoryDropdown ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Category dropdown menu */}
            {showCategoryDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-40">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Select Category
                  </p>
                </div>
                <div className="py-1 max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick('All')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                      selectedCategory === 'All'
                        ? 'bg-gray-50 text-dark-brown font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {selectedCategory === 'All' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
                    )}
                    <span>All</span>
                  </button>
                  {DEFAULT_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryClick(category)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                        selectedCategory === category
                          ? 'bg-gray-50 text-dark-brown font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {selectedCategory === category && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
                      )}
                      <span>{category}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile icon - only show if logged in, otherwise show login button */}
          {userName ? (
            <button
              type="button"
              onClick={() => navigate('/marketplace/profile')}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dark-brown to-accent-red flex items-center justify-center text-white text-sm font-semibold">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-medium text-dark-brown truncate max-w-[120px]">
                  {userName || 'Guest User'}
                </span>
                <span className="text-[11px] text-gray-500 truncate max-w-[140px]">
                  {userEmail || 'guest@example.com'}
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 hover:bg-gray-50 transition-colors text-sm font-paragraph text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 19.5a7.5 7.5 0 0115 0"
                />
              </svg>
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}


