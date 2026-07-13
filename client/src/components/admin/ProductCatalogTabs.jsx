import React, { useState } from 'react';
import ProductCatalog from './ProductCatalog';
import CustomCategories from './CustomCategories';

export default function ProductCatalogTabs() {
  const [activeTab, setActiveTab] = useState('timber');

  const categories = {
    timber: {
      name: 'Timber Products',
      description: 'Raw timber, logs, and wood materials',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    furniture: {
      name: 'Furniture',
      description: 'Finished furniture pieces and wooden furniture',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      buttonColor: 'bg-purple-600',
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      )
    },
    construction: {
      name: 'Construction Materials',
      description: 'Building materials, beams, and construction wood',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      buttonColor: 'bg-orange-600',
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`${
                  activeTab === key
                    ? `${category.iconColor} border-current`
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-150`}
              >
                <div className={`w-5 h-5 ${activeTab === key ? category.iconColor : 'text-gray-400'}`}>
                  {category.icon}
                </div>
                <span>{category.name}</span>
              </button>
            ))}
            <button
              onClick={() => setActiveTab('custom-categories')}
              className={`${
                activeTab === 'custom-categories'
                  ? 'text-green-600 border-green-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-150`}
            >
              <svg className={`w-5 h-5 ${activeTab === 'custom-categories' ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Custom Categories</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'custom-categories' ? (
        <CustomCategories />
      ) : (
        <ProductCatalog 
          category={activeTab} 
          categoryInfo={categories[activeTab]} 
        />
      )}
    </div>
  );
}

