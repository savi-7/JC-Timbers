import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

// Import newly generated high-quality editorial images
import blogImg1 from '../assets/blog_editorial_1.png';
import blogImg2 from '../assets/blog_editorial_2.png';
import blogImg3 from '../assets/blog_editorial_3.png';

export default function BlogInspiration() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(0);

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
        setPosts(getStaticBlogs());
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setPosts(getStaticBlogs());
    } finally {
      setLoading(false);
    }
  };

  const getStaticBlogs = () => [
    {
      id: 1,
      title: 'Architectural Harmony with Timber',
      excerpt: 'Exploring the intersection of modern minimalist design and the raw, timeless beauty of exotic hardwoods. Discover how natural materials elevate contemporary spaces into sanctuaries of calm.',
      cta: 'Explore Design',
      imageUrl: blogImg1,
      date: 'March 12, 2026'
    },
    {
      id: 2,
      title: 'The Art of the Craft',
      excerpt: 'A deep dive into the precision and dedication required to mold raw timber into functional art.',
      cta: 'Read Story',
      imageUrl: blogImg2,
      date: 'February 24, 2026'
    },
    {
      id: 3,
      title: 'Form & Function',
      excerpt: 'How our signature collections balance ergonomic comfort with striking, sculptural aesthetics.',
      cta: 'View Collection',
      imageUrl: blogImg3,
      date: 'January 18, 2026'
    }
  ];

  if (loading) {
    return (
      <section className="bg-cream py-32">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-heading text-dark-brown mb-6">The Journal</h2>
          <div className="flex gap-4 h-[500px]">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-1 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Ensure 3 posts
  const displayPosts = posts.slice(0, 3);

  return (
    <section className="bg-cream py-32 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header matching the FAQ sizing approach */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mb-16 flex flex-col md:flex-row md:justify-between md:items-end"
        >
          <div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-heading text-dark-brown leading-none tracking-tighter">
              The <span className="italic text-accent-red font-light">Journal</span>
            </h2>
          </div>
          <button
            onClick={() => navigate('/blog')}
            className="mt-6 md:mt-0 text-dark-brown font-paragraph uppercase tracking-widest text-sm hover:text-accent-red transition-colors font-bold pb-2 flex items-center group"
          >
            <span className="border-b border-current pb-1 mr-2">View All Articles</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </motion.div>

        {/* Expanding Hover Accordion Layout */}
        <div className="flex flex-col md:flex-row h-[800px] md:h-[500px] lg:h-[600px] w-full gap-2 md:gap-4 overflow-hidden rounded-2xl">
          {displayPosts.map((p, index) => {
            const isActive = hoveredIndex === index;
            return (
              <motion.div
                key={p.id}
                onHoverStart={() => setHoveredIndex(index)}
                onClick={() => setHoveredIndex(index)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative overflow-hidden rounded-xl transition-all duration-700 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)] cursor-pointer ${isActive ? 'md:flex-[3] flex-[3]' : 'md:flex-1 flex-1'}`}
              >
                {/* Background Image */}
                <img 
                  src={p.imageUrl} 
                  alt={p.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out origin-center ${isActive ? 'scale-105' : 'scale-125 opacity-70 grayscale-[50%]'}`}
                />
                
                {/* Overlay Gradients */}
                <div className={`absolute inset-0 bg-dark-brown/40 transition-opacity duration-700 ${isActive ? 'opacity-30' : 'opacity-60'}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-brown/90 via-dark-brown/20 to-transparent" />

                {/* Content Container */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end z-10 h-full">
                  <div className={`transition-all duration-700 w-full ${isActive ? 'translate-y-0 opacity-100' : 'md:translate-y-8 md:opacity-0 translate-y-0 opacity-100'}`}>
                    
                    {/* Meta */}
                    <div className="mb-4 flex items-center">
                      <span className={`bg-white/90 backdrop-blur-sm text-accent-red px-3 py-1 rounded-full font-paragraph text-[10px] uppercase tracking-widest font-bold transition-opacity duration-500 ${isActive ? 'opacity-100' : 'md:opacity-0 opacity-100'}`}>
                        Editorial
                      </span>
                      {isActive && (
                        <span className="ml-4 text-white/80 font-paragraph text-xs tracking-widest uppercase hidden md:inline-block">
                          {p.date}
                        </span>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h3 className={`font-heading text-white leading-tight mb-3 transition-all duration-500 max-w-lg ${isActive ? 'text-2xl md:text-5xl group-hover:text-cream' : 'text-xl md:text-2xl max-h-16 md:max-h-8 truncate md:whitespace-nowrap md:overflow-visible overflow-hidden'}`}>
                      {p.title}
                    </h3>
                    
                    {/* Excerpt and CTA (Only visible when active on Desktop) */}
                    <div className={`overflow-hidden transition-all duration-700 ${isActive ? 'max-h-48' : 'md:max-h-0 max-h-48'}`}>
                      <p className="text-white/80 font-paragraph text-sm md:text-lg max-w-md mb-6 line-clamp-2 md:line-clamp-3">
                        {p.excerpt}
                      </p>
                      
                      <div className="inline-flex items-center text-white font-paragraph text-xs uppercase tracking-widest font-bold group-hover:text-accent-red transition-colors duration-300">
                        <span className="border-b border-transparent group-hover:border-current pb-1 transition-colors">{p.cta}</span>
                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </div>
                    </div>

                  </div>
                </div>
                
                {/* Vertical Title for Inactive State (Desktop) */}
                <div className={`absolute left-6 bottom-8 w-[200px] -rotate-90 origin-bottom-left transition-all duration-700 hidden md:block ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                   <span className="font-heading text-xl text-white/80 tracking-widest whitespace-nowrap">
                     {p.title}
                   </span>
                </div>
                
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}








