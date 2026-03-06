
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
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

  // Custom Bento-Box Category Card
  const CategoryCard = ({ title, description, category, image, index }) => {
    const [imageError, setImageError] = useState(false);

    const getCategoryRoute = (category) => {
      switch (category) {
        case 'timber': return '/timber-products';
        case 'furniture': return '/furniture';
        case 'construction': return '/construction-materials';
        default: return '/timber-products';
      }
    };

    // Bento box sizing logic
    const gridClass = index === 0
      ? 'lg:col-span-2 lg:row-span-2 min-h-[400px] lg:min-h-[600px]'
      : 'lg:col-span-1 lg:row-span-1 min-h-[300px] lg:min-h-[290px]';

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "50px" }}
        transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={`relative bg-dark-brown rounded-3xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 will-change-transform ${gridClass}`}
        onClick={() => navigate(getCategoryRoute(category))}
      >
        {/* Full Bleed Image */}
        <div className="absolute inset-0 bg-dark-brown">
          {!imageError ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center opacity-30">
              <span className="text-6xl text-cream">{title.charAt(0)}</span>
            </div>
          )}
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-70"></div>
        </div>

        {/* Glassmorphic Content Panel */}
        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-8 rounded-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-\[0.22,1,0.36,1\]">
            <h3 className="text-2xl md:text-3xl font-heading text-cream font-bold mb-2 group-hover:text-white transition-colors">
              {title}
            </h3>
            <p className="text-cream/80 font-paragraph text-sm md:text-base line-clamp-2 max-w-md group-hover:text-cream transition-colors">
              {description}
            </p>
            <div className="mt-6 flex items-center text-accent-red font-medium group-hover:text-white transition-colors duration-300">
              <span className="mr-2 uppercase tracking-widest text-xs font-bold">Explore</span>
              <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
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
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl lg:text-6xl font-heading text-dark-brown mb-6 tracking-tight">Curated Collections</h2>
          <p className="text-xl text-dark-brown/80 font-paragraph max-w-2xl mx-auto">
            Discover our premium selection of timber products, furniture, and construction materials, crafted for excellence.
          </p>
        </motion.div>

        {/* Bento Box Category Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.category}
              title={category.title}
              description={category.description}
              category={category.category}
              image={category.image}
              index={index}
            />
          ))}
        </div>

        {/* Inline Pincode Checker */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 bg-cream rounded-xl p-8"
        >
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
            <div className={`mt-3 px-4 py-3 rounded-lg flex items-start gap-3 ${pinResult.ok
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
        </motion.div>
      </div>
    </section>
  );
}
