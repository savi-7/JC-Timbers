import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Hero3DBackground from "./Hero3DBackground";

export default function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-cream flex items-center justify-center">
      {/* 3D Animated Background - Fully Immersive */}
      <Hero3DBackground />

      {/* Main Hero Content overlays the 3D canvas */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pointer-events-none flex flex-col items-center justify-center h-full text-center">

        {/* Decorative Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-4"
        >
          <span className="uppercase tracking-[0.3em] text-accent-red font-bold text-sm md:text-base">
            Masterpieces in Wood
          </span>
        </motion.div>

        {/* Massive overlapping typography */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="relative mix-blend-multiply"
        >
          <h1 className="text-7xl md:text-[9rem] lg:text-[12rem] font-heading font-bold text-dark-brown/90 leading-none tracking-tighter drop-shadow-2xl">
            JC Timbers
          </h1>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 max-w-2xl mx-auto"
        >
          <p className="text-dark-brown text-lg md:text-xl font-medium font-paragraph leading-relaxed drop-shadow-sm">
            {t('hero.subtitle', "Discover our curated collection of handcrafted masterworks. Each piece is made from the finest materials with unparalleled attention to detail and craftsmanship.")}
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 pointer-events-auto flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/furniture')}
            className="bg-dark-brown text-cream px-10 py-4 rounded-full font-paragraph font-medium transition-all duration-300 hover:bg-accent-red hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 group"
          >
            {t('hero.cta', "Explore Collections")}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/about')}
            className="bg-white/50 backdrop-blur-md text-dark-brown border border-dark-brown/20 px-10 py-4 rounded-full font-paragraph font-medium transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105 flex items-center justify-center"
          >
            Our Story
          </button>
        </motion.div>

      </div>
    </section>
  );
}
