import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EntranceLoader({ onLoadingComplete }) {
  const [isLoading, setIsLoading] = useState(
    sessionStorage.getItem('hasSeenLoader') !== 'true'
  );

  useEffect(() => {
    if (!isLoading) {
      if (onLoadingComplete) onLoadingComplete();
      return;
    }

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem('hasSeenLoader', 'true');
      if (onLoadingComplete) onLoadingComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, onLoadingComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[10000] bg-cream flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-heading text-dark-brown font-bold flex flex-col items-center"
          >
            JC Timbers
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeInOut" }}
              className="h-1 bg-accent-red mt-4 rounded-full"
            />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6 text-dark-brown/70 font-paragraph tracking-widest uppercase text-sm"
          >
            Crafting Excellence
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
