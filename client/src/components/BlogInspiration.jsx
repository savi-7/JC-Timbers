import { useState, useEffect } from 'react';

export default function BlogInspiration() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/blogs');
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
    <section className="bg-cream py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-heading text-dark-brown mb-6">From the Blog</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow p-5">
              {p.imageUrl ? (
                <img 
                  src={p.imageUrl} 
                  alt={p.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              ) : (
                <div className="h-32 rounded bg-cream mb-3" />
              )}
              <h3 className="text-xl text-dark-brown font-heading">{p.title}</h3>
              <p className="mt-1 text-dark-brown/80 font-paragraph text-sm">{p.excerpt}</p>
              <button className="mt-3 bg-accent-red hover:bg-dark-brown text-white px-4 py-2 rounded-lg font-paragraph text-sm">
                {p.cta || 'Read More'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}








