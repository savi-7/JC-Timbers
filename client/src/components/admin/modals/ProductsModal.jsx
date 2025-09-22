import React from 'react';

export default function ProductsModal({ showProductsModal, setShowProductsModal, detailedData, safeStats }) {
  if (!showProductsModal) return null;

  // Debug logging
  console.log('ProductsModal Debug:', {
    detailedData,
    safeStats,
    productsCount: detailedData?.products?.length || 0,
    firstProduct: detailedData?.products?.[0],
    firstProductImages: detailedData?.products?.[0]?.images
  });

  // Helper to format currency in INR
  const formatINR = (amount) => {
    if (typeof amount !== 'number') return '₹0';
    return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Products Overview</h2>
          <button 
            onClick={() => setShowProductsModal(false)}
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
              <h3 className="text-sm font-medium text-green-800">Total Products</h3>
              <p className="text-2xl font-semibold text-green-900">{safeStats.totalProducts}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800">Low Stock Items</h3>
              <p className="text-2xl font-semibold text-yellow-900">{safeStats.lowStockItems}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800">Active Products</h3>
              <p className="text-2xl font-semibold text-blue-900">{safeStats.totalProducts}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
            <div className="space-y-3">
              {detailedData.products.length > 0 ? (
                detailedData.products.map((product, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
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
                                return 'https://via.placeholder.com/64x64/f3f4f6/9ca3af?text=No+Image';
                              })()}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/64x64/f3f4f6/9ca3af?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-lg">{product.name}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                            
                            <div className="flex items-center space-x-4 mt-3">
                              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                product.category === 'timber' 
                                  ? 'bg-green-100 text-green-800'
                                  : product.category === 'furniture'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
                              </span>
                              
                              <span className="text-lg font-bold text-gray-900">
                                {formatINR(product.price)}
                              </span>
                              
                              <span className={`text-sm font-medium px-2 py-1 rounded ${
                                product.quantity < 50 
                                  ? 'bg-orange-100 text-orange-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {product.quantity < 50 ? 'Limited Stock' : 'In Stock'}
                              </span>
                            </div>
                            
                            {/* Product Attributes */}
                            {product.attributes && Object.keys(product.attributes).length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(product.attributes).slice(0, 3).map(([key, value]) => (
                                    <span key={key} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      {key}: {value}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right text-sm text-gray-500 ml-4">
                            <p className="font-medium">Stock: {product.quantity} {product.unit}</p>
                            <p className="text-xs mt-1">
                              Created: {new Date(product.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">No products found</p>
                  <p className="text-sm">Products will appear here once they are added to the database.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

