import React from 'react';

export default function SystemStatus({ safeStats }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
        <p className="text-sm text-gray-600 mt-1">Current system alerts</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Low Stock Alert</p>
              <p className="text-xs text-yellow-600">{safeStats.lowStockItems} items need restocking</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-blue-800">Pending Orders</p>
              <p className="text-xs text-blue-600">{safeStats.pendingOrders} orders awaiting processing</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-green-800">System Status</p>
              <p className="text-xs text-green-600">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

