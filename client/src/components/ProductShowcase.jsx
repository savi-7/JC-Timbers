
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import timberImage from '../assets/timberproduct.png';
import furnitureImage from '../assets/furnitureshowcase.png';
import constructionImage from '../assets/construction.png';
import { getLocationFromPincode, validatePincode } from '../utils/pincodeLookup';

export default function ProductShowcase() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [pinResult, setPinResult] = useState(null);
  const [checking, setChecking] = useState(false);


  const checkPincode = async (e) => {
    e.preventDefault();
    
    if (!/^[0-9]{6}$/.test(pin)) {
      setPinResult({ ok: false, msg: 'Enter a valid 6-digit pincode' });
      return;
    }
    
    setChecking(true);
    setPinResult(null);
    
    // Kerala pincodes start with 67, 68, or 69
    const keralaPincodePrefixes = ['67', '68', '69'];
    const pincodePrefix = pin.substring(0, 2);
    const isKeralaPincode = keralaPincodePrefixes.includes(pincodePrefix);
    
    if (isKeralaPincode) {
      // Fetch exact location name using improved lookup utility
      try {
        const locationData = await getLocationFromPincode(pin);
        
        if (locationData && locationData.locationName) {
          // Show exact location name (town/city/village)
          const locationText = locationData.locationName;
          const districtText = locationData.district ? `, ${locationData.district}` : '';
          
          setPinResult({ 
            ok: true, 
            msg: `Delivery available to ${locationText}${districtText}, ${locationData.state}! We deliver to all locations in Kerala.` 
          });
        } else if (locationData && locationData.city) {
          // Fallback to city if location name not available
          setPinResult({ 
            ok: true, 
            msg: `Delivery available to ${locationData.city}, ${locationData.state}! We deliver to all locations in Kerala.` 
          });
        } else {
          // Final fallback
          setPinResult({ 
            ok: true, 
            msg: `Delivery available in your area! We deliver to all locations in Kerala.` 
          });
        }
      } catch (error) {
        // Fallback if API fails
        setPinResult({ 
          ok: true, 
          msg: `Delivery available in your area! We deliver to all locations in Kerala.` 
        });
      }
    } else {
      setPinResult({ 
        ok: false, 
        msg: 'Delivery not available. We currently deliver only to Kerala state. Please check back later for other locations.' 
      });
    }
    
    setChecking(false);
  };

  // Category card component - using the same layout as product cards
  const CategoryCard = ({ title, description, category, image }) => {
    const [imageError, setImageError] = useState(false);
    
    const getCategoryRoute = (category) => {
      switch (category) {
        case 'timber':
          return '/timber-products';
        case 'furniture':
          return '/furniture';
        case 'construction':
          return '/construction-materials';
        default:
          return '/timber-products';
      }
    };

    const handleCategoryClick = () => {
      navigate(getCategoryRoute(category));
    };

    const getCategoryIcon = () => {
      switch (category) {
        case 'timber':
          return '🪵';
        case 'furniture':
          return '🪑';
        case 'construction':
          return '🏗️';
        default:
          return '🪵';
      }
    };

    return (
      <div 
        className="product-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={handleCategoryClick}
      >
        <div className="image-container">
          {!imageError ? (
            <img 
              src={image} 
              alt={title}
              className="product-image"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dark-brown/20 via-accent-red/20 to-dark-brown/10 flex items-center justify-center">
              <div className="text-6xl opacity-60">{getCategoryIcon()}</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="card-content p-6">
          <div className="space-y-3">
            <h3 className="text-lg font-paragraph text-dark-brown font-medium line-clamp-2">{title}</h3>
            <p className="text-sm text-dark-brown/70 font-paragraph line-clamp-2">{description}</p>
          </div>
          <div className="flex gap-2 pt-4 mt-auto">
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                handleCategoryClick();
              }}
              className="flex-1 bg-accent-red hover:bg-dark-brown text-white px-4 py-3 rounded-lg text-sm font-paragraph transition-colors duration-200 font-medium"
            >
              Explore {title}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Category data
  const categories = [
    {
      title: 'Timber Products',
      description: 'Premium quality timber for all your woodworking needs',
      category: 'timber',
      image: timberImage
    },
    {
      title: 'Furniture',
      description: 'Handcrafted furniture pieces made from the finest materials',
      category: 'furniture',
      image: furnitureImage
    },
    {
      title: 'Construction Materials',
      description: 'Durable construction materials for your building projects',
      category: 'construction',
      image: constructionImage
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading text-dark-brown mb-4">Shop by Category</h2>
          <p className="text-lg text-dark-brown/80 font-paragraph max-w-2xl mx-auto">
            Discover our premium collection of timber products, furniture, and construction materials
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category) => (
            <CategoryCard 
              key={category.category}
              title={category.title}
              description={category.description}
              category={category.category}
              image={category.image}
            />
          ))}
        </div>

        {/* Inline Pincode Checker */}
        <div className="mt-16 bg-cream rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-heading text-dark-brown">Check Delivery Availability</h3>
              <p className="text-dark-brown/80 font-paragraph">Enter your pincode to check service in your area. We deliver to all locations in Kerala.</p>
            </div>
            <form onSubmit={checkPincode} className="flex w-full md:w-auto gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                value={pin}
                onChange={(e) => {
                  // Only allow numbers and limit to 6 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setPin(value);
                  // Clear result when user starts typing
                  if (pinResult) {
                    setPinResult(null);
                  }
                }}
                placeholder="e.g. 682001"
                className="flex-1 md:w-56 border border-cream rounded-lg px-3 py-2 text-dark-brown focus:ring-2 focus:ring-dark-brown focus:border-transparent"
                maxLength={6}
                required
              />
              <button 
                type="submit"
                disabled={checking}
                className="bg-accent-red hover:bg-dark-brown text-white px-5 py-2 rounded-lg transition-colors duration-200 font-paragraph disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checking ? 'Checking...' : 'Check'}
              </button>
            </form>
          </div>
          {pinResult && (
            <div className={`mt-3 px-4 py-3 rounded-lg flex items-start gap-3 ${
              pinResult.ok 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="flex-shrink-0 mt-0.5">
                {pinResult.ok ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="flex-1 font-paragraph">{pinResult.msg}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
