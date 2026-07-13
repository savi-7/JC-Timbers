import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Hero3DBackground from "./Hero3DBackground";

export default function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Sophisticated Parallax effects
  const yHeroText = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const yImage1 = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const yImage2 = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const scaleImage1 = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <section ref={containerRef} className="relative min-h-[100svh] bg-cream overflow-hidden pt-20 flex flex-col justify-center">
      {/* Abstract 3D Sculpture Background */}
      <Hero3DBackground />

      {/* Grid Lines Overlay for Architectural Feel */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10 flex justify-between px-6 md:px-12">
         <div className="w-[1px] h-full bg-dark-brown"></div>
         <div className="w-[1px] h-full bg-dark-brown hidden md:block"></div>
         <div className="w-[1px] h-full bg-dark-brown hidden lg:block"></div>
         <div className="w-[1px] h-full bg-dark-brown hidden xl:block"></div>
         <div className="w-[1px] h-full bg-dark-brown"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col pt-10 pb-20">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.div 
            style={{ y: yHeroText }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:w-2/3"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="w-12 h-[2px] bg-accent-red"></span>
              <span className="uppercase text-accent-red tracking-[0.2em] text-sm font-heading font-semibold">
                Est. 2026
              </span>
            </div>
            {/* Monumental Typography */}
            <h1 className="text-[12vw] md:text-[8vw] leading-[0.85] font-heading text-dark-brown uppercase tracking-tighter">
              Mastering<br />
              <span className="pl-[10%] italic font-light">Timber.</span>
            </h1>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
             className="w-full md:w-1/3 flex flex-col items-start md:items-end text-left md:text-right"
          >
             <p className="text-dark-brown/70 text-lg lg:text-xl font-paragraph max-w-sm mb-8 leading-relaxed">
               {t('hero.subtitle', "Redefining architectural excellence through the finest selection of sustainable, high-grade timber structures.")}
             </p>
             <div className="flex gap-4">
               <button
                  onClick={() => navigate('/timber-products')}
                  className="relative group overflow-hidden bg-dark-brown text-cream px-8 py-4 rounded-none font-paragraph text-sm uppercase tracking-widest transition-all"
               >
                 <span className="relative z-10">{t('hero.cta', "View Projects")}</span>
                 <div className="absolute inset-0 bg-accent-red scale-y-0 origin-bottom transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"></div>
               </button>
             </div>
          </motion.div>
        </div>

        {/* Cinematic Imagery Section */}
        <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full flex justify-end items-end no-wrap">
          
           {/* Primary Large Image */}
           <motion.div
             style={{ y: yImage1, scale: scaleImage1 }}
             initial={{ opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' }}
             animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
             transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
             className="w-full md:w-[75%] h-full relative z-10 overflow-hidden"
           >
             <img 
               src="https://images.unsplash.com/photo-1510698115663-8a3014c2b979?q=80&w=2670&auto=format&fit=crop" 
               alt="Modern Timber Architecture"
               className="object-cover w-full h-[120%] -top-[10%] relative object-center"
               fetchPriority="high"
             />
             <div className="absolute bottom-6 left-6 mix-blend-difference text-cream font-paragraph text-sm tracking-widest uppercase">
               Architecture / 01
             </div>
           </motion.div>

           {/* Secondary Overlapping Image */}
           <motion.div
             style={{ y: yImage2 }}
             initial={{ opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' }}
             animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
             transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
             className="absolute bottom-[-10%] left-[5%] md:left-[10%] w-[50%] md:w-[30%] lg:w-[25%] aspect-[3/4] z-20 shadow-2xl border-4 border-cream hidden sm:block"
           >
             <div className="w-full h-full overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop" 
                 alt="Timber Detail"
                 className="object-cover w-full h-full scale-110"
               />
             </div>
           </motion.div>

        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5], y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 z-20"
      >
        <span className="text-dark-brown text-xs font-paragraph tracking-[0.3em] uppercase rotate-90 origin-left mb-6">Scroll</span>
        <div className="w-[1px] h-12 bg-dark-brown/30 relative overflow-hidden">
           <motion.div 
             animate={{ y: ['-100%', '100%'] }}
             transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
             className="w-full h-1/2 bg-accent-red absolute"
           />
        </div>
      </motion.div>
    </section>
  );
}
