export default function HighlightedCategories() {
  const categories = [
    {
      key: 'timber',
      title: 'Timber Products',
      description: 'Logs, planks, chips and more',
      cta: 'Shop Timber',
      imageClass: 'bg-[url(/src/assets/teakwoodplanks.png)]',
      href: '/shop?category=timber'
    },
    {
      key: 'furniture',
      title: 'Furniture',
      description: 'Tables, chairs, beds, custom pieces',
      cta: 'Shop Furniture',
      imageClass: 'bg-[url(/src/assets/furnitureshowcase.png)]',
      href: '/shop?category=furniture'
    },
    {
      key: 'construction',
      title: 'Construction Products',
      description: 'Doors, windows, plywood, flooring',
      cta: 'Shop Construction',
      imageClass: 'bg-[url(/src/assets/construction.png)]',
      href: '/shop?category=construction'
    }
  ];

  return (
    <section className="bg-cream py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-heading text-dark-brown mb-8">Explore Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <a
              key={cat.key}
              href={cat.href}
              className="group relative rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-300 bg-white"
            >
              <div className={`h-48 bg-cover bg-center ${cat.imageClass} group-hover:scale-105 transition-transform duration-300`}></div>
              <div className="p-5">
                <h3 className="text-xl font-heading text-dark-brown">{cat.title}</h3>
                <p className="text-dark-brown/80 font-paragraph text-sm mt-1">{cat.description}</p>
                <button className="mt-4 bg-accent-red hover:bg-dark-brown text-white px-4 py-2 rounded-lg font-paragraph transition-colors duration-200">
                  {cat.cta}
                </button>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}








