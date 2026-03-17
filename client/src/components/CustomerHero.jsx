import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import api from "../api/axios";

export default function CustomerHero() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  
  const [, setCartCount] = useState(0);
  const [, setWishlistCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      if (isAuthenticated) {
        try {
          const cartRes = await api.get('/cart');
          const wishRes = await api.get('/wishlist');
          setCartCount(cartRes.data.items?.reduce((s, i) => s + i.quantity, 0) || 0);
          setWishlistCount(wishRes.data.items?.length || 0);
        } catch (e) {
          console.error('Fetch error:', e);
        }
      }
    };
    fetchCounts();
  }, [isAuthenticated]);

  // 3D Hover Effect Logic
  const boundedRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    if (!boundedRef.current) return;
    const rect = boundedRef.current.getBoundingClientRect();
    // Calculate mouse position relative to the center of the card (-1 to 1)
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Rotate based on mouse position (invert Y for natural tilt)
  const rotateX = useTransform(smoothY, [-1, 1], [15, -15]);
  const rotateY = useTransform(smoothX, [-1, 1], [-15, 15]);
  
  // Floating layers inside the 3D card
  const layer1Z = useTransform(smoothX, [-1, 1], [-20, 20]);
  const layer2Z = useTransform(smoothY, [-1, 1], [30, -30]);

  return (
    <section className="relative z-10 w-full min-h-[90svh] bg-cream overflow-hidden pt-20 pb-16 flex flex-col justify-center perspective-1000">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-dark-brown/5 skew-x-12 translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-[1600px] w-full mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center h-full">
        
        {/* Left Side: Staggered 3D Typography */}
        <div className="flex flex-col justify-center h-full z-20">


           <motion.h1 
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
             className="text-5xl md:text-7xl font-heading text-dark-brown leading-[1.1] tracking-tight mb-6"
           >
             Welcome back, <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark-brown to-accent-red">
               {user?.name || t('customerHero.valuedCustomer')}
             </span>
           </motion.h1>

           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.5 }}
             className="font-paragraph text-dark-brown/70 text-lg md:text-xl leading-relaxed max-w-lg mb-10"
           >
             Immerse yourself in our collection of flawlessly milled timber and exotic hardwoods. Your absolute best projects start here.
           </motion.p>

           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
             className="flex flex-col sm:flex-row gap-5"
           >
              <button 
                onClick={() => navigate('/timber-products')}
                className="group relative px-8 py-4 bg-dark-brown text-cream overflow-hidden rounded-xl font-paragraph text-sm uppercase tracking-widest transition-all shadow-[0_10px_30px_-10px_rgba(101,67,33,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(101,67,33,0.7)] hover:-translate-y-1"
              >
                <span className="relative z-10 group-hover:text-dark-brown transition-colors duration-300 font-semibold">Explore Timber</span>
                <div className="absolute inset-0 bg-cream transform scale-y-0 origin-bottom transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 rounded-xl"></div>
              </button>
              
              <button 
                onClick={() => navigate('/cart')}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-white/50 border border-dark-brown/20 text-dark-brown rounded-xl font-paragraph text-sm uppercase tracking-widest transition-all hover:bg-white hover:border-dark-brown"
              >
                <span>Active Cart</span>
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </button>
           </motion.div>
        </div>

        {/* Right Side: 3D Interactive Hover Card */}
        <div className="relative h-[60vh] lg:h-[75vh] w-full flex items-center justify-center perspective-1000">
           
           <motion.div
             ref={boundedRef}
             onMouseMove={handleMouseMove}
             onMouseLeave={handleMouseLeave}
             style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
             initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
             animate={{ opacity: 1, scale: 1, rotateY: 0 }}
             transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
             className="relative w-full md:w-[85%] lg:w-[95%] aspect-[3/4] lg:aspect-square rounded-[2rem] shadow-2xl shadow-dark-brown/30 border border-white/50 cursor-crosshair"
           >
             {/* Base Image Layer */}
             <div className="absolute inset-0 rounded-[2rem] overflow-hidden" style={{ transform: "translateZ(-20px)" }}>
                 <img 
                   src="https://images.unsplash.com/photo-1541194577687-8c63bf9e7ee3?q=80&w=2670&auto=format&fit=crop" 
                   alt="Exotic Timber"
                   className="object-cover w-full h-full scale-105"
                 />
                 <div className="absolute inset-0 bg-gradient-to-tr from-dark-brown/60 to-transparent mix-blend-multiply"></div>
             </div>



             {/* Bottom Decorative Title (Translates Z heavily) */}
             <motion.div 
               style={{ transform: "translateZ(100px)" }}
               className="absolute bottom-10 left-10 pointer-events-none"
             >
                <div className="overflow-hidden">
                   <motion.h2 
                     initial={{ y: "100%" }}
                     animate={{ y: 0 }}
                     transition={{ duration: 1, delay: 1 }}
                     className="text-white text-4xl md:text-5xl font-heading leading-none mix-blend-overlay"
                   >
                     Nature's
                   </motion.h2>
                </div>
                <div className="overflow-hidden">
                   <motion.h2 
                     initial={{ y: "100%" }}
                     animate={{ y: 0 }}
                     transition={{ duration: 1, delay: 1.2 }}
                     className="text-white text-5xl md:text-6xl font-heading leading-none"
                   >
                     Masterpiece
                   </motion.h2>
                </div>
             </motion.div>

             {/* 3D Reflection Glare */}
             <motion.div 
               style={{ 
                 opacity: useTransform(smoothX, [-1, 1], [0, 0.3]),
                 background: "linear-gradient(105deg, transparent 20%, white 45%, white 55%, transparent 80%)",
                 transform: "translateZ(10px)"
               }}
               className="absolute inset-0 mix-blend-overlay pointer-events-none rounded-[2rem]"
             />

           </motion.div>

        </div>
      </div>
    </section>
  );
}
