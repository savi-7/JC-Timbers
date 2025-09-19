export default function WhyChooseUs() {
  const items = [
    { title: 'Sustainably Sourced Wood', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" /></svg>
    )},
    { title: 'High-Quality Craftsmanship', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M6 7v13m12-13v13M9 10h6" /></svg>
    )},
    { title: 'Fast Delivery', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13h13l3 4H6m10-8h3l2 3" /></svg>
    )},
    { title: 'After-Sales Support', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 10c0-3.314-2.686-6-6-6S6 6.686 6 10s2.686 6 6 6c1.657 0 3 1.343 3 3v1" /></svg>
    )}
  ];

  return (
    <section className="bg-cream py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-heading text-dark-brown mb-6">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((i) => (
            <div key={i.title} className="bg-white rounded-xl shadow p-5">
              <div className="w-10 h-10 rounded-lg bg-cream text-dark-brown flex items-center justify-center">
                {i.icon}
              </div>
              <div className="mt-3 text-dark-brown font-medium">{i.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}








