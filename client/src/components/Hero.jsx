import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import dashboardImg from "../assets/dashboard.png";
import Hero3DBackground from "./Hero3DBackground";

export default function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      {/* 3D Animated Background */}
      <Hero3DBackground />

      {/* Main Hero Content */}
      <div className="bg-cream/70 py-20 relative z-10 backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-heading text-dark-brown mb-8 leading-tight">
              JC Timbers
            </h1>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-12"
          >
            <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden w-full group">
              <img
                src={dashboardImg}
                alt="Living room"
                className="w-full h-[426px] object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ minWidth: 0, maxWidth: "100%" }}
                fetchPriority="high"
              />
            </div>
          </motion.div>

          {/* Description and CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="flex-1">
              <p className="text-dark-brown text-lg leading-relaxed max-w-2xl font-paragraph">
                {t('hero.subtitle')}
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                className="bg-accent-red hover:bg-dark-brown text-white px-8 py-3 rounded-lg font-paragraph transition-transform duration-300 hover:scale-105 shadow-lg"
              >
                {t('hero.cta')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
