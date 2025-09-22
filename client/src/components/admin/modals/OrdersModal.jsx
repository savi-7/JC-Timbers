import React from 'react';

export default function OrdersModal({ showOrdersModal, setShowOrdersModal, detailedData, safeStats }) {
  if (!showOrdersModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Orders Overview</h2>
          <button 
            onClick={() => setShowOrdersModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-sm font-medium text-green-800">Total Orders</h3>
              <p className="text-2xl font-semibold text-green-900">{safeStats.totalOrders}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800">Pending Orders</h3>
              <p className="text-2xl font-semibold text-yellow-900">{safeStats.pendingOrders}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800">Completed Orders</h3>
              <p className="text-2xl font-semibold text-blue-900">{safeStats.totalOrders - safeStats.pendingOrders}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Order Details</h3>
            <div className="space-y-3">
              {detailedData.orders && detailedData.orders.length > 0 ? (
                detailedData.orders.map((order, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">Order #{order._id?.slice(-8) || 'N/A'}</h4>
                        <p className="text-sm text-gray-600">{order.customerName || 'Customer'}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            ₹{order.totalAmount || 0}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                        <p className="text-xs mt-1">
                          Items: {order.items?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">No orders found</p>
                  <p className="text-sm">Orders will appear here once customers place them.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

