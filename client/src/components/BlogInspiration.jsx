import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE } from '../config';

export default function BlogInspiration() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(API_BASE + '/blogs');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.blogs || []);
      } else {
        console.error('Failed to fetch blogs');
        // Fallback to static data if API fails
        setPosts(getStaticBlogs());
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      // Fallback to static data if API fails
      setPosts(getStaticBlogs());
    } finally {
      setLoading(false);
    }
  };

  const getStaticBlogs = () => [
    {
      id: 1,
      title: 'How to Choose the Right Wood',
      excerpt: 'Understand hardwood vs softwood, grain, and durability.',
      cta: 'Read Article'
    },
    {
      id: 2,
      title: 'Sustainable Timber Practices',
      excerpt: 'Learn how we source eco-friendly wood responsibly.',
      cta: 'Learn More'
    },
    {
      id: 3,
      title: 'Care Tips for Your Furniture',
      excerpt: 'Extend the life of your wooden furniture with these tips.',
      cta: 'Get Tips'
    }
  ];

  if (loading) {
    return (
      <section className="bg-cream py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-heading text-dark-brown mb-6">From the Blog</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow p-5">
                <div className="h-32 rounded bg-gray-200 animate-pulse" />
                <div className="mt-3 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="mt-2 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="mt-3 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <h2 className="text-5xl lg:text-6xl font-heading text-dark-brown mb-4 tracking-tight">Journal</h2>
            <p className="text-dark-brown/70 font-paragraph text-xl max-w-lg">Insights, guides, and inspiration for your next architectural masterpiece.</p>
          </div>
          <button className="hidden md:inline-flex items-center gap-2 text-accent-red font-bold uppercase tracking-widest text-sm group">
            View All Articles
            <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {posts.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "50px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative h-[450px] md:h-[500px] rounded-3xl overflow-hidden cursor-pointer"
            >
              {/* Image Background */}
              <div className="absolute inset-0 bg-dark-brown">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-60 group-hover:opacity-80"
                  />
                ) : (
                  <div className="w-full h-full bg-dark-brown flex items-center justify-center opacity-50">
                    <span className="text-6xl text-cream opacity-50">{p.title.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-brown via-dark-brown/40 to-transparent pointer-events-none" />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="text-accent-red font-bold text-xs uppercase tracking-[0.2em] mb-4">Woodworking</span>
                <h3 className="text-3xl text-cream font-heading mb-4 leading-tight group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                  {p.title}
                </h3>
                <div className="overflow-hidden h-0 group-hover:h-20 transition-all duration-500 ease-out">
                  <p className="text-cream/80 font-paragraph text-sm md:text-base line-clamp-2">
                    {p.excerpt}
                  </p>
                  <span className="inline-block mt-3 text-cream font-bold text-sm uppercase tracking-wider border-b border-accent-red pb-1">Read Article</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-10 text-center md:hidden">
          <button className="inline-flex items-center gap-2 text-accent-red font-bold uppercase tracking-widest text-sm group">
            View All Articles
            <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}








