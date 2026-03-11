import { motion } from "framer-motion";

export default function Testimonials() {
  // No testimonials data - will be loaded from API when available
  const items = [];

  return (
    <section className="bg-cream py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-heading text-dark-brown mb-10 text-center"
        >
          What Our Customers Say
        </motion.h2>
        {items.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } }
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {items.map(t => (
              <motion.div
                key={t.name}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
                }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-cream" />
                  <div>
                    <div className="text-dark-brown font-medium font-paragraph">{t.name}</div>
                    <div className="text-sm text-dark-brown/70 font-paragraph">{t.role}</div>
                  </div>
                </div>
                <div className="mt-4 text-dark-brown/90 font-paragraph leading-relaxed">"{t.text}"</div>
                <div className="mt-3 text-yellow-500 text-sm">★★★★★</div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <p className="text-dark-brown/70 text-lg font-paragraph">Customer testimonials will be displayed here.</p>
            <p className="text-dark-brown/50 text-sm mt-2 font-paragraph">No testimonials available at the moment.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}




