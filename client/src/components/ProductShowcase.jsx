import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import timberImage from '../assets/timberproduct.png';
import furnitureImage from '../assets/furnitureshowcase.png';
import constructionImage from '../assets/construction.png';
import { getLocationFromPincode } from '../utils/pincodeLookup';

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
      try {
        const locationData = await getLocationFromPincode(pin);

        if (locationData && locationData.locationName) {
          const locationText = locationData.locationName;
          const districtText = locationData.district ? `, ${locationData.district}` : '';

          setPinResult({
            ok: true,
            msg: `Delivery available to ${locationText}${districtText}, ${locationData.state}! We deliver to all locations in Kerala.`
          });
        } else if (locationData && locationData.city) {
          setPinResult({
            ok: true,
            msg: `Delivery available to ${locationData.city}, ${locationData.state}! We deliver to all locations in Kerala.`
          });
        } else {
          setPinResult({
            ok: true,
            msg: `Delivery available in your area! We deliver to all locations in Kerala.`
          });
        }
      } catch (error) {
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

    const handleCategoryClick = () => navigate(getCategoryRoute(category));

    const getCategoryIcon = () => {
      switch (category) {
        case 'timber': return '🪵';
        case 'furniture': return '🪑';
        case 'construction': return '🏗️';
        default: return '🪵';
      }
    };

    return (
      <div className="w-[85vw] md:w-[320px] lg:w-[400px] h-[450px] flex-shrink-0 perspective-1000 group">
        <motion.div
          className="relative w-full h-full bg-cream/10 rounded-2xl overflow-hidden cursor-pointer"
          onClick={handleCategoryClick}
        >
          {/* Image */}
          {!imageError ? (
            <motion.img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
             <div className="absolute inset-0 bg-gradient-to-br from-dark-brown/10 to-cream flex items-center justify-center">
               <div className="text-6xl opacity-60 drop-shadow-sm">{getCategoryIcon()}</div>
             </div>
          )}

          {/* Dark Overlay for contrast */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />

          {/* Text Content Reveal */}
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white">
            <h3 className="text-2xl md:text-3xl font-heading mb-3 font-bold tracking-wide">
              {title}
            </h3>
            
            {/* Hidden stuff that slides up on hover */}
            <div className="overflow-hidden">
              <div className="translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                <p className="font-paragraph text-base md:text-lg text-white/90 mb-5 max-w-sm">
                  {description}
                </p>
                <button
                  className="bg-accent-red text-white py-3 px-8 rounded-full text-sm font-paragraph uppercase tracking-wider hover:bg-white hover:text-accent-red transition-colors duration-300"
                >
                  Explore Collection
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const categories = [
    { title: 'Timber Products', description: 'Premium quality timber for all your woodworking needs', category: 'timber', image: timberImage },
    { title: 'Furniture', description: 'Handcrafted furniture pieces made from the finest materials', category: 'furniture', image: furnitureImage },
    { title: 'Construction Materials', description: 'Durable construction materials for your building projects', category: 'construction', image: constructionImage }
  ];

  const targetRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-65%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-dark-brown text-white">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Massive Background Title */}
        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-5 pointer-events-none">
          <h2 className="text-7xl md:text-9xl font-heading whitespace-nowrap">CATEGORIES</h2>
        </div>

        <motion.div style={{ x }} className="flex gap-8 px-12 relative z-10 w-max">
          {/* Intro Card */}
          <div className="w-[85vw] md:w-[30vw] h-[450px] flex flex-col justify-center px-8 flex-shrink-0">
            <h2 className="text-4xl md:text-5xl font-heading mb-4 tracking-tight">Shop by<br/><span className="text-accent-red italic">Category</span></h2>
            <p className="text-lg font-paragraph text-white/70 max-w-sm">
              Discover our premium collection. Scroll horizontally to explore our curated selection of timber, furniture, and construction materials.
            </p>
          </div>

          {categories.map((category, index) => (
            <CategoryCard key={category.category} {...category} index={index} />
          ))}
        </motion.div>
      </div>

      {/* Pincode Checker Outside Sticky Section */}
      <div className="relative bg-white py-32 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-red/5 via-dark-brown/5 to-accent-red/5 rounded-[3rem] blur-xl" />
            <div className="relative bg-cream/30 rounded-[3rem] p-10 md:p-16 shadow-2xl border border-cream/50 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden">
              <div className="relative z-10 max-w-xl">
                <h3 className="text-4xl md:text-5xl font-heading text-dark-brown mb-4 tracking-tight">Delivery Availability</h3>
                <p className="text-xl text-dark-brown/70 font-paragraph">Enter your pincode to check service in your area. We deliver strictly across Kerala.</p>
              </div>
              
              <form onSubmit={checkPincode} className="relative z-10 flex flex-col w-full md:w-auto gap-4">
                <div className="flex w-full gap-3">
                  <div className="relative flex-1 md:w-72">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPin(value);
                        if (pinResult) setPinResult(null);
                      }}
                      placeholder="e.g. 682001"
                      className="w-full bg-white border-2 border-dark-brown/10 rounded-2xl px-6 py-5 text-dark-brown text-xl font-paragraph focus:border-accent-red focus:ring-0 outline-none transition-all shadow-sm"
                      maxLength={6}
                      required
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={checking}
                    className="bg-dark-brown hover:bg-accent-red text-white px-10 py-5 rounded-2xl transition-colors duration-300 font-paragraph font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0"
                  >
                    {checking ? '...' : 'Verify'}
                  </motion.button>
                </div>

                {/* Result Message */}
                {pinResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 px-6 py-4 rounded-xl flex items-center gap-4 shadow-sm ${pinResult.ok ? 'bg-green-50/80 text-green-800' : 'bg-red-50/80 text-red-800'}`}
                  >
                    <div className={`p-2 rounded-full ${pinResult.ok ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {pinResult.ok ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                    </div>
                    <p className="flex-1 font-paragraph text-base font-medium">{pinResult.msg}</p>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
