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
    <section className="bg-cream py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-heading text-dark-brown mb-2">From the Blog</h2>
          <p className="text-dark-brown/80 font-paragraph text-lg">Guides, tips, and inspiration for your next project</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {posts.map(p => (
            <motion.div
              key={p.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300"
            >
              {p.imageUrl ? (
                <div className="overflow-hidden h-48">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="h-48 w-full bg-cream" />
              )}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-2xl text-dark-brown font-heading mb-3 line-clamp-2">{p.title}</h3>
                <p className="text-dark-brown/70 font-paragraph text-sm mb-6 flex-1 line-clamp-3">{p.excerpt}</p>
                <div className="mt-auto">
                  <button className="bg-accent-red hover:bg-dark-brown text-white px-5 py-2.5 rounded-lg font-paragraph text-sm transition-colors duration-200">
                    {p.cta || 'Read More'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}








