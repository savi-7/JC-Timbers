import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ProductForm from '../ProductForm';
import { useNotification } from '../NotificationProvider';

export default function ProductCatalog({ category, categoryInfo }) {
  const { showSuccess, showError } = useNotification();
  
  // State management
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Subcategory filtering for timber products
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');

  // Timber subcategories
  const timberSubcategories = [
    { value: 'all', label: 'All Timber Products' },
    { value: 'planks', label: 'Planks' },
    { value: 'beams', label: 'Beams' },
    { value: 'billet', label: 'Billet' },
    { value: 'venners', label: 'Venners' },
    { value: 'board_and_slabs', label: 'Board & Slabs' },
    { value: 'laths', label: 'Laths' },
    { value: 'stumps_blocks', label: 'Stumps & Blocks' }
  ];

  // Fetch products for this specific category
  useEffect(() => {
    fetchProducts();
  }, [category, selectedSubcategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/products?category=${category}&limit=50`;
      
      // Add subcategory filter for timber products
      if (category === 'timber' && selectedSubcategory !== 'all') {
        url += `&subcategory=${selectedSubcategory}`;
      }
      
      const response = await api.get(url);
      setProducts(response.data.products || []);
      setStats(response.data.stats || null);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch products';
      setError(message);
      console.error('Error fetching products:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      showSuccess('Product deleted successfully!');
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading {categoryInfo.name}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchProducts}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${categoryInfo.bgColor} rounded-lg flex items-center justify-center`}>
              {categoryInfo.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{categoryInfo.name}</h2>
              <p className="text-sm text-gray-600">{categoryInfo.description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowProductForm(true)}
            className={`${categoryInfo.buttonColor} hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
          >
            Add New {categoryInfo.name}
          </button>
        </div>
      </div>

      {/* Subcategory Filter for Timber Products */}
      {category === 'timber' && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Filter by Timber Type:</h3>
            <div className="flex flex-wrap gap-2">
              {timberSubcategories.map((subcategory) => (
                <button
                  key={subcategory.value}
                  onClick={() => setSelectedSubcategory(subcategory.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedSubcategory === subcategory.value
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {subcategory.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${categoryInfo.bgColor} rounded-lg flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${categoryInfo.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Quantity</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalQuantity}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-lg font-semibold text-gray-900">{stats.lowStockCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avg Price</p>
                <p className="text-lg font-semibold text-gray-900">₹{Math.round(stats.averagePrice)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{categoryInfo.name} Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={product._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={(() => {
                            const firstImage = product.images[0];
                            if (firstImage.url) {
                              return firstImage.url;
                            }
                            if (firstImage.data) {
                              if (firstImage.data.startsWith('data:')) {
                                return firstImage.data;
                              }
                              return `data:${firstImage.contentType || 'image/jpeg'};base64,${firstImage.data}`;
                            }
                            return 'https://via.placeholder.com/48x48/f3f4f6/9ca3af?text=No+Image';
                          })()} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className={product.quantity < 5 ? 'text-red-600 font-semibold' : 'font-medium'}>{product.quantity}</span>
                        {product.quantity < 5 && (
                          <svg className="w-4 h-4 text-red-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.quantity < 5 ? 'bg-red-100 text-red-800' : 
                        product.quantity < 20 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {product.quantity < 5 ? 'Low Stock' : 
                         product.quantity < 20 ? 'Medium Stock' : 
                         'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductForm(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No {categoryInfo.name} products</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by adding a new product.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={selectedProduct}
          defaultCategory={category}
          onClose={() => {
            setShowProductForm(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setShowProductForm(false);
            setSelectedProduct(null);
            fetchProducts();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Product</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProduct(deleteConfirm._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
