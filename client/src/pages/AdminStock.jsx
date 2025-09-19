import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../components/NotificationProvider';

export default function AdminStock() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  // State management
  const [stockItems, setStockItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [showStockForm, setShowStockForm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  
  // Stock form data
  const [stockForm, setStockForm] = useState({
    name: '',
    category: 'timber',
    quantity: '',
    unit: 'cubic ft',
    attributes: {}
  });

  // Category-specific attribute configurations
  const categoryAttributes = {
    timber: {
      woodType: '',
      dimension: '',
      grade: ''
    },
    furniture: {
      furnitureType: '',
      material: '',
      polish: ''
    },
    construction: {
      productType: '',
      size: '',
      finish: ''
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchStockData();
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get('http://localhost:5001/api/stock', { headers });
      setStockItems(response.data.stockItems);
      setStats(response.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!stockForm.name || !stockForm.category || !stockForm.unit) {
      showError('Please fill in all required fields');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/stock', stockForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showSuccess('Stock item added successfully!');
      setShowStockForm(false);
      setStockForm({
        name: '',
        category: 'timber',
        quantity: '',
        unit: 'cubic ft',
        attributes: {}
      });
      fetchStockData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add stock item');
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'timber':
        return 'bg-blue-100 text-blue-800';
      case 'construction':
        return 'bg-orange-100 text-orange-800';
      case 'furniture':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Back to Admin Dashboard Button */}
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
              
              {/* Profile Icon with Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mt-1">
                        Admin
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalItems}</p>
                  <p className="text-xs text-gray-500">Stock items</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Quantity</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalQuantity}</p>
                  <p className="text-xs text-gray-500">Units in stock</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Low Stock</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.lowStockCount}</p>
                  <p className="text-xs text-gray-500">Items need restocking</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Low Stock</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.lowStockCount}</p>
                  <p className="text-xs text-gray-500">Items need restocking</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex space-x-4">
          <button
            onClick={() => setShowStockForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Add Stock Item
          </button>
        </div>

        {/* Stock Items Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Stock Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attributes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockItems.map((item, index) => (
                  <tr key={item._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className={item.quantity < 5 ? 'text-red-600 font-semibold' : 'font-medium'}>{item.quantity}</span>
                        {item.quantity < 5 && (
                          <svg className="w-4 h-4 text-red-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {Object.entries(item.attributes || {}).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedStock(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStock(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Stock Form Modal */}
      {showStockForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Stock Item</h3>
              <form onSubmit={handleStockSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      required
                      value={stockForm.name}
                      onChange={(e) => {
                        const newForm = { ...stockForm };
                        newForm.name = e.target.value;
                        setStockForm(newForm);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <select
                      required
                      value={stockForm.category}
                      onChange={(e) => {
                        const newForm = { ...stockForm };
                        newForm.category = e.target.value;
                        newForm.attributes = categoryAttributes[e.target.value];
                        setStockForm(newForm);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="timber">Timber</option>
                      <option value="construction">Construction</option>
                      <option value="furniture">Furniture</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={stockForm.quantity}
                      onChange={(e) => {
                        const newForm = { ...stockForm };
                        newForm.quantity = e.target.value;
                        setStockForm(newForm);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit *</label>
                    <select
                      required
                      value={stockForm.unit}
                      onChange={(e) => {
                        const newForm = { ...stockForm };
                        newForm.unit = e.target.value;
                        setStockForm(newForm);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="cubic ft">Cubic ft</option>
                      <option value="pieces">Pieces</option>
                    </select>
                  </div>
                </div>

                {/* Category-specific attributes */}
                {stockForm.category === 'timber' && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Timber Attributes</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Wood Type</label>
                        <input
                          type="text"
                          value={stockForm.attributes.woodType || ''}
                          onChange={(e) => {
                            const newForm = { ...stockForm };
                            newForm.attributes.woodType = e.target.value;
                            setStockForm(newForm);
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="e.g., Teak, Rosewood"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Dimension</label>
                        <input
                          type="text"
                          value={stockForm.attributes.dimension || ''}
                          onChange={(e) => {
                            const newForm = { ...stockForm };
                            newForm.attributes.dimension = e.target.value;
                            setStockForm(newForm);
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="e.g., 2x4x8"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Grade</label>
                        <input
                          type="text"
                          value={stockForm.attributes.grade || ''}
                          onChange={(e) => {
                            const newForm = { ...stockForm };
                            newForm.attributes.grade = e.target.value;
                            setStockForm(newForm);
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="e.g., A, B, C"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {stockForm.category === 'furniture' && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Furniture Attributes</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Furniture Type</label>
                        <input
                          type="text"
                          value={stockForm.attributes.furnitureType || ''}
                          onChange={(e) => {
                            const newForm = { ...stockForm };
                            newForm.attributes.furnitureType = e.target.value;
                            setStockForm(newForm);
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="e.g., Chair, Table, Cabinet"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Material</label>
                        <input
                          type="text"
                          value={stockForm.attributes.material || ''}
                          onChange={(e) => {
                            const newForm = { ...stockForm };
                            newForm.attributes.material = e.target.value;
                            setStockForm(newForm);
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="e.g., Wood, Metal, Plastic"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Polish</label>
                        <input
                          type="text"
                          value={stockForm.attributes.polish || ''}
                          onChange={(e) => {
                            const newForm = { ...stockForm };
                            newForm.attributes.polish = e.target.value;
                            setStockForm(newForm);
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="e.g., Matte, Glossy, Satin"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {stockForm.category === 'construction' && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Construction Attributes</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Product Type</label>
                        <input
                          type="text"
                          value={stockForm.attributes.productType || ''}
                          onChange={(e) => {
                            const newForm = { ...stockForm };
                            newForm.attributes.productType = e.target.value;
                            setStockForm(newForm);
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="e.g., Beam, Column, Panel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Size</label>
                        <input
                          type="text"
                          value={stockForm.attributes.size || ''}
                          onChange={(e) => {
                            const newForm = { ...stockForm };
                            newForm.attributes.size = e.target.value;
                            setStockForm(newForm);
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="e.g., 6x8x12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Finish</label>
                        <input
                          type="text"
                          value={stockForm.attributes.finish || ''}
                          onChange={(e) => {
                            const newForm = { ...stockForm };
                            newForm.attributes.finish = e.target.value;
                            setStockForm(newForm);
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="e.g., Rough, Smooth, Treated"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                  >
                    Add Stock Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStockForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
