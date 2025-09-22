import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <p className="text-sm text-gray-600 mt-1">Manage your business operations</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/admin/vendors')}
            className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-150 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Vendors</h3>
            <p className="text-sm text-gray-600">Manage vendors and wood intake</p>
          </button>

          <button 
            onClick={() => navigate('/admin/stock')}
            className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-150 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Stock</h3>
            <p className="text-sm text-gray-600">Manage inventory and stock levels</p>
          </button>

          <button 
            onClick={() => navigate('/admin/products')}
            className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-150 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Products</h3>
            <p className="text-sm text-gray-600">Manage products and attributes</p>
          </button>

          <button 
            onClick={() => navigate('/admin/users')}
            className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-150 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Users</h3>
            <p className="text-sm text-gray-600">View customers and orders</p>
          </button>
        </div>
      </div>
    </div>
  );
}

