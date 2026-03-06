import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function AboutUsSection() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section ref={containerRef} id="about-us" className="py-24 md:py-32 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 relative items-start">

          {/* Left Column - Sticky Image Panel */}
          <div className="w-full lg:w-5/12 lg:sticky lg:top-32 h-[50vh] lg:h-[70vh] relative rounded-3xl overflow-hidden shadow-2xl">
            <motion.img
              style={{ y: y1 }}
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Cozy living room with rustic furniture"
              className="absolute inset-0 w-full h-[120%] object-cover -top-[10%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-brown/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-8 left-8 right-8 text-cream">
              <span className="uppercase tracking-[0.2em] font-bold text-sm mb-2 block">Established 2004</span>
              <h3 className="text-3xl font-heading">Generations of Craftsmanship</h3>
            </div>
          </div>

          {/* Right Column - Scrolling Story */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center space-y-16 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-6xl md:text-8xl font-heading text-dark-brown leading-none tracking-tighter mb-8">
                <span className="text-accent-red block italic pr-2">The Story</span>
                Behind the Wood
              </h2>
              <p className="text-dark-brown/80 text-xl leading-relaxed font-paragraph">
                JC Timbers is a family-owned business dedicated to delivering the finest timber and furniture products in India. With over 20 years of experience, we blend traditional craftsmanship with modern design.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-4xl font-heading text-dark-brown mb-6">Sustainable Core</h3>
              <p className="text-dark-brown/80 text-xl leading-relaxed font-paragraph mb-8">
                Our commitment to sustainability means we source our materials responsibly, supporting local communities and the environment. Every piece is built to be beautiful and enduring.
              </p>
              <button
                onClick={() => navigate('/about')}
                className="group relative inline-flex items-center gap-4 text-dark-brown font-bold text-lg overflow-hidden"
              >
                <span className="relative z-10 transition-colors group-hover:text-accent-red">Discover Our Heritage</span>
                <div className="w-12 h-12 rounded-full border border-dark-brown flex items-center justify-center transition-all group-hover:border-accent-red group-hover:bg-accent-red">
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
