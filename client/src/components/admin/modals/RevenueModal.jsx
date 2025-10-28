import React from 'react';

export default function RevenueModal({ showRevenueModal, setShowRevenueModal, detailedData }) {
  if (!showRevenueModal) return null;

  const revenue = detailedData.revenue || {};

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setShowRevenueModal(false)}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-green-600">
            <div>
              <h2 className="text-2xl font-bold text-white">Revenue Statistics</h2>
              <p className="text-sm text-emerald-50 mt-1">Track your business revenue and payments</p>
            </div>
            <button
              onClick={() => setShowRevenueModal(false)}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Revenue */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-6 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-emerald-900">Total Revenue</h3>
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-emerald-900">₹{(revenue.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-emerald-700 mt-1">{revenue.totalPaidOrders || 0} paid orders</p>
              </div>

              {/* Online Revenue */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-blue-900">Online Payments</h3>
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-900">₹{(revenue.onlineRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-blue-700 mt-1">{revenue.onlineOrders || 0} orders</p>
              </div>

              {/* COD Revenue */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-orange-900">COD Received</h3>
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-orange-900">₹{(revenue.codRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-orange-700 mt-1">{revenue.codOrders || 0} orders</p>
              </div>

              {/* Pending COD */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-6 border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-yellow-900">COD Pending</h3>
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-yellow-900">₹{(revenue.pendingCODRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-yellow-700 mt-1">{revenue.pendingCODOrdersCount || 0} pending</p>
              </div>
            </div>

            {/* Revenue Breakdown Chart */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
              
              {/* Progress Bars */}
              <div className="space-y-6">
                {/* Online Revenue */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Online Payments</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{(revenue.onlineRevenue || 0).toLocaleString()}
                      {revenue.totalRevenue > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({((revenue.onlineRevenue / revenue.totalRevenue) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: revenue.totalRevenue > 0 ? `${(revenue.onlineRevenue / revenue.totalRevenue) * 100}%` : '0%' }}
                    />
                  </div>
                </div>

                {/* COD Received */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">COD Received</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{(revenue.codRevenue || 0).toLocaleString()}
                      {revenue.totalRevenue > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({((revenue.codRevenue / revenue.totalRevenue) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: revenue.totalRevenue > 0 ? `${(revenue.codRevenue / revenue.totalRevenue) * 100}%` : '0%' }}
                    />
                  </div>
                </div>

                {/* Pending COD */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">COD Pending Collection</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{(revenue.pendingCODRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: revenue.totalRevenue > 0 
                          ? `${(revenue.pendingCODRevenue / (revenue.totalRevenue + revenue.pendingCODRevenue)) * 100}%` 
                          : revenue.pendingCODRevenue > 0 ? '100%' : '0%' 
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {revenue.pendingCODOrdersCount || 0} COD orders awaiting payment collection
                  </p>
                </div>
              </div>
            </div>

            {/* Info Alert */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">About Revenue Tracking</h3>
                <p className="text-sm text-blue-700 mt-1">
                  • <strong>Online Payments:</strong> Revenue from completed online transactions (Razorpay, UPI, Card, etc.)<br />
                  • <strong>COD Received:</strong> Cash on Delivery payments that have been collected and marked as paid by admin<br />
                  • <strong>COD Pending:</strong> Cash on Delivery orders awaiting payment collection<br />
                  • <strong>Total Revenue:</strong> Sum of all received payments (Online + COD Received)
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowRevenueModal(false)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

