export default function Testimonials() {
  // No testimonials data - will be loaded from API when available
  const items = [];

  return (
    <section className="bg-cream py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-heading text-dark-brown mb-6">What Our Customers Say</h2>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map(t => (
              <div key={t.name} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream" />
                  <div>
                    <div className="text-dark-brown font-medium">{t.name}</div>
                    <div className="text-xs text-dark-brown/70">{t.role}</div>
                  </div>
                </div>
                <div className="mt-3 text-dark-brown/90">"{t.text}"</div>
                <div className="mt-2 text-yellow-500">★★★★★</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-dark-brown/70 text-lg">Customer testimonials will be displayed here.</p>
            <p className="text-dark-brown/50 text-sm mt-2">No testimonials available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}




