import React from 'react';

export default function PaymentSection({ paymentMethod, setPaymentMethod, disabled }) {
  const paymentOptions = [
    {
      id: 'razorpay',
      name: 'Razorpay (Online Payment)',
      description: 'Pay securely using Credit/Debit Card, UPI, Net Banking',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      description: 'Pay with cash when your order is delivered',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-dark-brown text-white rounded-full flex items-center justify-center font-semibold">
          2
        </div>
        <h2 className="text-xl font-bold text-dark-brown">Payment Method</h2>
      </div>

      <div className="space-y-3">
        {paymentOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => !disabled && setPaymentMethod(option.id)}
            className={`
              relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
              ${paymentMethod === option.id 
                ? 'border-dark-brown bg-amber-50' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-start space-x-4">
              {/* Radio button */}
              <div className="flex items-center h-6">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${paymentMethod === option.id 
                    ? 'border-dark-brown' 
                    : 'border-gray-300'
                  }
                `}>
                  {paymentMethod === option.id && (
                    <div className="w-3 h-3 rounded-full bg-dark-brown"></div>
                  )}
                </div>
              </div>

              {/* Icon */}
              <div className={`
                ${paymentMethod === option.id 
                  ? 'text-dark-brown' 
                  : 'text-gray-500'
                }
              `}>
                {option.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{option.name}</div>
                <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                
                {/* Razorpay logos */}
                {option.id === 'razorpay' && paymentMethod === 'razorpay' && (
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Powered by</span>
                    <span className="text-sm font-bold text-blue-600">Razorpay</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {disabled && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <span className="font-medium">⚠ Please save your delivery address first</span>
          </p>
        </div>
      )}
    </div>
  );
}


