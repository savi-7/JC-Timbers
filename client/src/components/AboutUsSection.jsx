import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function AboutUsSection() {
  const navigate = useNavigate();

  return (
    <section id="about-us" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* About Us Layout */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Living Room Image and CTA */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="relative group overflow-hidden rounded-lg shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Cozy living room with rustic furniture"
                className="w-full h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
            </div>
            <div className="space-y-4">
              <p className="text-dark-brown text-lg leading-relaxed font-paragraph">
              </p>
            </div>
          </motion.div>

          {/* Right Column - About Us Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8 flex flex-col justify-center"
          >
            {/* About Us Header */}
            <div className="text-center md:text-left">
              <h2 className="text-6xl md:text-7xl font-heading text-dark-brown leading-tight mb-4 hidden md:block">
                <span className="text-7xl md:text-8xl">A</span>bout <span className="text-7xl md:text-8xl">U</span>s
              </h2>
              <h2 className="text-5xl font-heading text-dark-brown leading-tight mb-4 md:hidden">
                About Us
              </h2>
              <p className="text-accent-red font-medium tracking-wide uppercase text-sm font-paragraph mb-6">Our Story</p>
              <p className="text-dark-brown text-lg leading-relaxed font-paragraph mb-8">
                JC Timbers is a family-owned business dedicated to delivering the finest timber and furniture products in India. With over 20 years of experience, we blend traditional craftsmanship with modern design, ensuring every piece is both beautiful and durable. Our commitment to sustainability means we source our materials responsibly, supporting local communities and the environment. From custom furniture to construction timber, we take pride in our attention to detail and customer satisfaction. Join us on our journey to create spaces that inspire and endure.
              </p>
              <div className="flex justify-center md:justify-start">
                <button
                  className="bg-accent-red hover:bg-dark-brown text-white px-8 py-3 rounded-lg font-paragraph transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
