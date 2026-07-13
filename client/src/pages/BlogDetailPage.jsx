import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

export default function BlogDetailPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE}/blogs/${id}`);
        if (!res.ok) throw new Error('Blog not found');
        const data = await res.json();
        if (!cancelled) setBlog(data.blog || null);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load blog');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to blog</Link>

        {loading && (
          <div className="mt-6 space-y-3">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-2/3" />
            <div className="h-80 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && blog && (
          <article className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
            {blog.imageUrl ? (
              <img src={blog.imageUrl} alt={blog.title} className="w-full h-72 object-cover" />
            ) : null}
            <div className="p-6 md:p-8">
              <p className="text-xs text-gray-500 mb-3">
                {formatDate(blog.publishedAt || blog.createdAt)} {blog.author ? `· ${blog.author}` : ''}
              </p>
              <h1 className="text-3xl md:text-4xl font-heading text-dark-brown mb-4">{blog.title}</h1>
              {blog.excerpt ? (
                <p className="text-gray-700 text-lg mb-6">{blog.excerpt}</p>
              ) : null}
              <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
                {blog.content}
              </div>
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}

