import React from 'react';

export function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
        <p className="text-gray-600">Please wait while we fetch your data...</p>
      </div>
    </div>
  );
}

export function ErrorState({ error }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-150"
          >
            Retry
          </button>
          <div className="text-sm text-gray-500 bg-gray-100 rounded-lg p-4">
            <p className="font-medium mb-2">If the problem persists, please check:</p>
            <ul className="text-left space-y-1">
              <li>• Server is running on port 5001</li>
              <li>• You are logged in as an admin</li>
              <li>• Database connection is working</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

