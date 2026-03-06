import { motion } from "framer-motion";

export default function Testimonials() {
  const items = [
    {
      name: "Arjun Mehta",
      role: "Architect",
      text: "The quality of teak wood from JC Timbers is unparalleled. It completely elevated our recent villa project to absolute luxury."
    },
    {
      name: "Priya Sharma",
      role: "Interior Designer",
      text: "Their handcrafted furniture pieces bring so much character and warmth into modern spaces. Highly recommended for premium builds."
    },
    {
      name: "Rohan Desai",
      role: "Homeowner",
      text: "Smooth delivery and incredible craftsmanship. The dining table we ordered is the centerpiece of our home, breathtaking details."
    }
  ];

  return (
    <section className="bg-white py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="uppercase tracking-[0.2em] text-accent-red font-bold text-sm mb-4 block">Testimonials</span>
          <h2 className="text-5xl lg:text-6xl font-heading text-dark-brown tracking-tight">Client Stories</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "50px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="bg-cream p-10 rounded-3xl relative overflow-hidden group hover:bg-dark-brown transition-colors duration-500 cursor-default"
            >
              {/* Quote Mark Decoration */}
              <div className="absolute -top-4 -right-2 text-9xl text-dark-brown/5 group-hover:text-white/5 font-heading pointer-events-none transition-colors duration-500">
                "
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-accent-red flex items-center justify-center text-white font-bold text-xl group-hover:bg-white group-hover:text-accent-red transition-colors duration-500">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-dark-brown font-bold font-heading text-lg group-hover:text-cream transition-colors duration-500">{t.name}</div>
                  <div className="text-sm text-dark-brown/60 uppercase tracking-wider font-bold group-hover:text-cream/60 transition-colors duration-500">{t.role}</div>
                </div>
              </div>

              <p className="text-dark-brown/90 font-paragraph leading-relaxed text-lg mb-6 group-hover:text-cream/90 transition-colors duration-500">
                "{t.text}"
              </p>

              <div className="flex text-accent-red gap-1 group-hover:text-cream transition-colors duration-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}




