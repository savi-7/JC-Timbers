import { motion } from "framer-motion";

export default function WhyChooseUs() {
  const items = [
    {
      title: 'Sustainably Sourced Wood', icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" /></svg>
      )
    },
    {
      title: 'High-Quality Craftsmanship', icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M6 7v13m12-13v13M9 10h6" /></svg>
      )
    },
    {
      title: 'Fast Delivery', icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13h13l3 4H6m10-8h3l2 3" /></svg>
      )
    },
    {
      title: 'After-Sales Support', icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 10c0-3.314-2.686-6-6-6S6 6.686 6 10s2.686 6 6 6c1.657 0 3 1.343 3 3v1" /></svg>
      )
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="bg-cream py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-heading text-dark-brown mb-10 text-center"
        >
          Why Choose Us
        </motion.h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
        >
          {items.map((i) => (
            <motion.div
              key={i.title}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center transition-shadow hover:shadow-md cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-cream text-dark-brown flex items-center justify-center mb-4 transition-transform duration-300">
                {i.icon}
              </div>
              <div className="text-dark-brown font-medium font-paragraph">{i.title}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}








