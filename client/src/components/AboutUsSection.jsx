import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AboutUsSection() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Independent parallax speeds for different elements
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const y3 = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);

  return (
    <section 
      ref={containerRef}
      id="about-us" 
      className="relative min-h-[150vh] bg-cream py-32 overflow-hidden flex items-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(205,33,34,0.03)_0%,transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 h-full flex items-center">
        
        {/* Asymmetric Image Collage */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          {/* Main Large Image */}
          <motion.div 
            style={{ y: y1 }}
            className="absolute top-[10%] right-[5%] w-[40vw] max-w-[500px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Timber workshop"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Secondary Floating Image */}
          <motion.div 
            style={{ y: y2 }}
            className="absolute top-[40%] left-[5%] w-[25vw] max-w-[300px] aspect-square rounded-full overflow-hidden shadow-xl border-8 border-cream"
          >
            <img
              src="https://images.unsplash.com/photo-1622372736562-b9e71ec646e2?q=80&w=600&auto=format&fit=crop"
              alt="Wood grain detail"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Tertiary Small Accent Image */}
          <motion.div 
            style={{ y: y3 }}
            className="absolute bottom-[10%] right-[30%] w-[20vw] max-w-[250px] aspect-video rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src="https://images.unsplash.com/photo-1538688423619-a80d85a7536e?q=80&w=600&auto=format&fit=crop"
              alt="Craftsmanship tools"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Central Bold Typography */}
        <motion.div 
          style={{ opacity }}
          className="relative z-20 w-full max-w-2xl mx-auto text-center md:text-left md:ml-[10%] bg-cream/80 backdrop-blur-md p-10 rounded-[3rem] border border-white shadow-2xl"
        >
          <div className="space-y-8">
            <h2 className="text-5xl md:text-6xl font-heading text-dark-brown leading-[0.85] tracking-tighter">
              BEYOND<br/>
              <span className="text-accent-red italic">WOOD</span>
            </h2>
            
            <p className="text-lg md:text-xl text-dark-brown/80 font-paragraph leading-relaxed">
              For over two decades, JC Timbers has redefined the intersection of nature and architecture. We don't just supply timber; we cultivate enduring foundations.
            </p>

            <button
              onClick={() => navigate('/about')}
              className="group relative inline-flex items-center justify-center gap-4 bg-dark-brown text-white py-4 px-10 rounded-full font-paragraph text-lg overflow-hidden hover:bg-accent-red transition-colors duration-500"
            >
              <span className="relative z-10">Discover Our Legacy</span>
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
