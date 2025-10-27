import React from 'react';

export default function StarRating({ rating, setRating, readonly = false, size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };
  
  const sizeClass = sizes[size] || sizes.md;
  
  const handleClick = (value) => {
    if (!readonly && setRating) {
      setRating(value);
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readonly}
          className={`${sizeClass} ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
          }`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <svg
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'
            }`}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// Display-only component with rating number
export function StarRatingDisplay({ rating, reviewCount, showCount = true, size = 'md' }) {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={Math.round(rating)} readonly size={size} />
      <span className="text-sm text-gray-600">
        {rating > 0 ? rating.toFixed(1) : '0.0'}
        {showCount && reviewCount > 0 && (
          <span className="ml-1">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
        )}
      </span>
    </div>
  );
}

