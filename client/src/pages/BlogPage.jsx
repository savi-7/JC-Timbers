import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_BASE } from '../config';

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE}/blogs`);
        if (!res.ok) throw new Error('Failed to fetch blogs');
        const data = await res.json();
        if (!cancelled) setBlogs(data.blogs || []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to fetch blogs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-heading text-dark-brown mb-3">Our Blog</h1>
          <p className="text-gray-600 max-w-2xl">
            Read detailed articles on timber craftsmanship, design ideas, and care tips.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <div className="text-gray-600">No published articles yet.</div>
        )}

        {!loading && !error && blogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <article key={blog.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {blog.imageUrl ? (
                  <img src={blog.imageUrl} alt={blog.title} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gray-100" />
                )}
                <div className="p-5">
                  <p className="text-xs text-gray-500 mb-2">
                    {formatDate(blog.publishedAt)} {blog.author ? `· ${blog.author}` : ''}
                  </p>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
                  <Link to={`/blog/${blog.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

