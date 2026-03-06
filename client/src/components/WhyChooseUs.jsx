import { motion } from "framer-motion";

export default function WhyChooseUs() {
  const items = [
    {
      title: 'Sustainably Sourced',
      desc: 'We partner with responsible forests to ensure every piece of timber contributes to a greener, sustainable future.',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" /></svg>,
      span: 'md:col-span-2 md:row-span-2'
    },
    {
      title: 'Master Craftsmanship',
      desc: 'Decades of experience poured into every detail.',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M6 7v13m12-13v13M9 10h6" /></svg>,
      span: 'md:col-span-1 md:row-span-1'
    },
    {
      title: 'Fast Delivery',
      desc: 'Optimized logistics to get your materials on time.',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13h13l3 4H6m10-8h3l2 3" /></svg>,
      span: 'md:col-span-1 md:row-span-1'
    },
    {
      title: 'Dedicated Support',
      desc: 'Our team is always here to assist you with your projects.',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 10c0-3.314-2.686-6-6-6S6 6.686 6 10s2.686 6 6 6c1.657 0 3 1.343 3 3v1" /></svg>,
      span: 'md:col-span-2 md:row-span-1'
    }
  ];

  return (
    <section className="bg-dark-brown py-24 overflow-hidden text-cream">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="uppercase tracking-[0.2em] text-accent-red font-bold text-sm mb-4 block">Our Commitment</span>
          <h2 className="text-5xl lg:text-6xl font-heading mb-6 tracking-tight">Why Choose Us</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[250px]">
          {items.map((i, index) => (
            <motion.div
              key={i.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ scale: 0.98, transition: { duration: 0.2 } }}
              className={`relative bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col justify-between overflow-hidden group cursor-pointer ${i.span}`}
            >
              {/* Subtle hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 w-16 h-16 rounded-2xl bg-cream/10 text-accent-red flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                {i.icon}
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className={`font-heading font-medium mb-2 ${index === 0 ? 'text-3xl lg:text-4xl' : 'text-xl'}`}>{i.title}</h3>
                <p className={`text-cream/70 font-paragraph ${index === 0 ? 'text-lg max-w-md' : 'text-sm'}`}>{i.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}








