import React from 'react';

export default function OrderSummarySection({ cartItems, subtotal, shipping, total, disabled, onPlaceOrder, loading }) {
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getImageUrl = (item) => {
    if (item.image) {
      // If it's a data URL
      if (item.image.startsWith('data:')) {
        return item.image;
      }
      // If it's a regular URL
      if (item.image.startsWith('http')) {
        return item.image;
      }
      // If it's a path
      return item.image;
    }
    return 'https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No+Image';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-dark-brown text-white rounded-full flex items-center justify-center font-semibold">
          3
        </div>
        <h2 className="text-xl font-bold text-dark-brown">Order Summary</h2>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p>Your cart is empty</p>
          </div>
        ) : (
          cartItems.map((item, index) => (
            <div key={index} className="flex space-x-4 pb-4 border-b border-gray-100 last:border-0">
              <img
                src={getImageUrl(item)}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No+Image';
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Quantity: {item.quantity}
                </p>
                <p className="text-sm font-semibold text-dark-brown mt-1">
                  {formatINR(item.price)} × {item.quantity} = {formatINR(item.subtotal)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6 pt-4 border-t-2 border-gray-200">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal ({cartItems.length} items)</span>
          <span className="font-medium">{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              formatINR(shipping)
            )}
          </span>
        </div>
        {subtotal > 0 && subtotal < 1000 && (
          <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
            💡 Add {formatINR(1000 - subtotal)} more to get FREE shipping!
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-dark-brown pt-3 border-t-2 border-gray-200">
          <span>Total</span>
          <span>{formatINR(total)}</span>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={onPlaceOrder}
        disabled={disabled || loading || cartItems.length === 0}
        className={`
          w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 transform
          ${disabled || loading || cartItems.length === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-dark-brown hover:bg-accent-red hover:shadow-lg hover:scale-105 active:scale-95'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Place Order - ${formatINR(total)}`
        )}
      </button>

      {disabled && cartItems.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 text-center">
            <span className="font-medium">⚠ Complete the steps above to place your order</span>
          </p>
        </div>
      )}

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center">
            <svg className="w-6 h-6 text-green-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs text-gray-600">Secure Payment</span>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-6 h-6 text-blue-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs text-gray-600">Quality Assured</span>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-6 h-6 text-purple-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-xs text-gray-600">Easy Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}


