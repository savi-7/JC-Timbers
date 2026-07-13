import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import wcuWood from "../assets/wcu_wood.png";
import wcuCraft from "../assets/wcu_craft.png";
import wcuDelivery from "../assets/wcu_delivery.png";
import wcuSupport from "../assets/wcu_support.png";

const images = [wcuWood, wcuCraft, wcuDelivery, wcuSupport];

export default function WhyChooseUs() {
  const items = [
    {
      title: 'Sustainably Sourced Wood', 
      icon: (
        <svg className="w-8 h-8 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" /></svg>
      )
    },
    {
      title: 'High-Quality Craftsmanship', 
      icon: (
        <svg className="w-8 h-8 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M6 7v13m12-13v13M9 10h6" /></svg>
      )
    },
    {
      title: 'Fast Delivery', 
      icon: (
        <svg className="w-8 h-8 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13h13l3 4H6m10-8h3l2 3" /></svg>
      )
    },
    {
      title: 'After-Sales Support', 
      icon: (
        <svg className="w-8 h-8 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 10c0-3.314-2.686-6-6-6S6 6.686 6 10s2.686 6 6 6c1.657 0 3 1.343 3 3v1" /></svg>
      )
    }
  ];

  const [hoveredIndex, setHoveredIndex] = useState(0);

  return (
    <section className="relative min-h-screen bg-dark-brown py-32 overflow-hidden flex items-center">
      {/* Dynamic Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={hoveredIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.4, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={images[hoveredIndex] || images[0]}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-dark-brown/60 backdrop-blur-[2px]" />
        </motion.div>
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Huge Sticky Title */}
          <div className="lg:col-span-4 h-full relative">
            <div className="sticky top-40 space-y-6">
              <motion.h2 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl font-heading text-white leading-none tracking-tight"
              >
                Why<br/>
                <span className="text-accent-red italic">Choose</span><br/>
                Us
              </motion.h2>
              <motion.p
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.3 }}
                 className="text-lg text-white/50 font-paragraph max-w-sm"
              >
                Experience the finest quality timber and craftsmanship delivered with exceptional editorial service.
              </motion.p>
            </div>
          </div>

          {/* Right Column: Giant Numbered List */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            <div className="space-y-0 w-full">
              {items.map((item, index) => {
                const isHovered = hoveredIndex === index;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onHoverStart={() => setHoveredIndex(index)}
                    className="border-b border-white/20 last:border-0 group cursor-pointer py-10 w-full block"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                      <div className="flex items-center gap-8">
                        <span className={`text-5xl md:text-6xl font-heading font-light transition-colors duration-500 ${isHovered ? 'text-accent-red' : 'text-white/20'}`}>
                          0{index + 1}
                        </span>
                        <div>
                          <h3 className={`text-2xl md:text-4xl font-heading transition-colors duration-500 ${isHovered ? 'text-white' : 'text-white/50'}`}>
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      
                      <motion.div 
                        initial={false}
                        animate={{ 
                          x: isHovered ? 0 : -20,
                          opacity: isHovered ? 1 : 0 
                        }}
                        className="hidden md:flex items-center justify-center w-16 h-16 rounded-full border border-white/20 text-white"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}








