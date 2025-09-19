export default function BlogInspiration() {
  const posts = [
    { title: 'How to Choose the Right Wood', excerpt: 'Understand hardwood vs softwood, grain, and durability.', cta: 'Read Article' },
    { title: 'Sustainable Timber Practices', excerpt: 'Learn how we source eco-friendly wood responsibly.', cta: 'Learn More' },
    { title: 'Care Tips for Your Furniture', excerpt: 'Extend the life of your wooden furniture with these tips.', cta: 'Get Tips' }
  ];

  return (
    <section className="bg-cream py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-heading text-dark-brown mb-6">From the Blog</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map(p => (
            <div key={p.title} className="bg-white rounded-xl shadow p-5">
              <div className="h-32 rounded bg-cream" />
              <h3 className="mt-3 text-xl text-dark-brown font-heading">{p.title}</h3>
              <p className="mt-1 text-dark-brown/80 font-paragraph text-sm">{p.excerpt}</p>
              <button className="mt-3 bg-accent-red hover:bg-dark-brown text-white px-4 py-2 rounded-lg font-paragraph text-sm">{p.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}








