import React, { useState } from 'react';

export function LogoutConfirmation({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
              <p className="text-sm text-gray-600">You're about to leave the admin dashboard</p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-3">
              Are you sure you want to logout from the admin dashboard? You will need to login again to access the admin panel.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-yellow-800">
                  <strong>Security Notice:</strong> This is the only way to exit the admin dashboard. Browser back navigation is disabled for security purposes.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-150"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useLogoutConfirmation() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const showConfirmation = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirm = (logoutFunction) => {
    setShowLogoutConfirm(false);
    logoutFunction();
  };

  const handleCancel = () => {
    setShowLogoutConfirm(false);
  };

  return {
    showLogoutConfirm,
    showConfirmation,
    handleConfirm,
    handleCancel
  };
}

