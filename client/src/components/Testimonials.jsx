import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Testimonials() {
  const defaultItems = [
    {
      name: "Sarah Jenkins",
      role: "Architect",
      text: "The quality of timber from JC Timbers transformed our entire project. Their attention to detail and sustainable sourcing is unparalleled."
    },
    {
      name: "David Chen",
      role: "Master Craftsman",
      text: "I've worked with wood for 30 years, and the material I receive from JC Timbers is consistently the finest I've ever handled."
    },
    {
      name: "Elena Rodriguez",
      role: "Homeowner",
      text: "Our custom dining table is the centerpiece of our home. The craftsmanship and love put into the wood is evident in every grain."
    }
  ];

  const [items, setItems] = useState(defaultItems); // Placeholder for API integration
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(interval);
  }, [items]);

  return (
    <section className="py-40 bg-white relative overflow-hidden flex items-center min-h-screen">
      {/* Editorial Decorative Elements */}
      <div className="absolute top-10 left-10 text-[30vw] font-heading text-cream/30 leading-none pointer-events-none select-none z-0">
        "
      </div>
      
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        
        {items.length > 0 ? (
          <div className="relative h-[60vh] flex items-center justify-center">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} // smooth editorial ease
                className="text-center max-w-5xl mx-auto absolute w-full"
              >
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-heading text-dark-brown leading-tight tracking-tight mb-12">
                  <span className="italic text-accent-red font-light">"</span>
                  {items[currentIndex].text}
                  <span className="italic text-accent-red font-light">"</span>
                </h3>
                
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-16 h-[1px] bg-dark-brown/20 mb-4" />
                  <p className="text-xl md:text-2xl font-heading text-dark-brown font-semibold uppercase tracking-widest">
                    {items[currentIndex].name}
                  </p>
                  <p className="text-sm md:text-base text-dark-brown/50 font-paragraph tracking-widest uppercase">
                    {items[currentIndex].role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Pagination / Progress Dots */}
            <div className="absolute bottom-[-10vh] left-1/2 -translate-x-1/2 flex gap-4">
               {items.map((_, idx) => (
                 <button 
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${idx === currentIndex ? 'bg-accent-red scale-125' : 'bg-dark-brown/20 hover:bg-dark-brown/40'}`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                 />
               ))}
            </div>

          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-32"
          >
            <p className="text-3xl font-heading text-dark-brown/40">Gathering stories...</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}




