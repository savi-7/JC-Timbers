import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useNotification } from '../components/NotificationProvider';

export default function AdminContentManagement() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState('blogs');
  const [loading, setLoading] = useState(false);

  // Data states
  const [blogs, setBlogs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Form states
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', content: '', author: '', published: false, image: null });
  const [editingBlogId, setEditingBlogId] = useState(null);

  const [showFaqForm, setShowFaqForm] = useState(false);
  const [faqForm, setFaqForm] = useState({ category: '', question: '', answer: '', order: 0 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'blogs') {
        const res = await api.get('/blogs/admin/all');
        setBlogs(res.data.blogs || []);
      } else if (activeTab === 'faqs') {
        const res = await api.get('/faqs/admin');
        setFaqs(res.data.faqs || []);
      } else if (activeTab === 'contacts') {
        const res = await api.get('/contacts/admin');
        setContacts(res.data.contacts || []);
      }
    } catch (error) {
      showError(`Failed to load ${activeTab}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- BLOGS ---
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', blogForm.title);
      formData.append('excerpt', blogForm.excerpt);
      formData.append('content', blogForm.content);
      formData.append('author', blogForm.author);
      formData.append('published', blogForm.published);
      if (blogForm.image) {
        formData.append('image', blogForm.image);
      }

      if (editingBlogId) {
        await api.put(`/blogs/admin/${editingBlogId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showSuccess('Blog updated successfully');
      } else {
        await api.post('/blogs/admin', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showSuccess('Blog added successfully');
      }
      setShowBlogForm(false);
      setEditingBlogId(null);
      setBlogForm({ title: '', excerpt: '', content: '', author: '', published: false, image: null });
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || (editingBlogId ? 'Failed to update blog' : 'Failed to add blog'));
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlogId(blog.id);
    setBlogForm({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      author: blog.author || '',
      published: !!blog.published,
      image: null,
    });
    setShowBlogForm(true);
  };

  const handleCancelBlogEdit = () => {
    setShowBlogForm(false);
    setEditingBlogId(null);
    setBlogForm({ title: '', excerpt: '', content: '', author: '', published: false, image: null });
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      await api.delete(`/blogs/admin/${id}`);
      showSuccess('Blog deleted');
      fetchData();
    } catch (error) {
      showError('Failed to delete blog');
    }
  };

  const handleToggleBlogForm = () => {
    if (showBlogForm) {
      handleCancelBlogEdit();
    } else {
      setShowBlogForm(true);
    }
  };

  // --- FAQS ---
  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/faqs/admin', faqForm);
      showSuccess('FAQ added successfully');
      setShowFaqForm(false);
      setFaqForm({ category: '', question: '', answer: '', order: 0 });
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add FAQ');
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await api.delete(`/faqs/admin/${id}`);
      showSuccess('FAQ deleted');
      fetchData();
    } catch (error) {
      showError('Failed to delete FAQ');
    }
  };

  // --- CONTACTS ---
  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this contact request?')) return;
    try {
      await api.delete(`/contacts/admin/${id}`);
      showSuccess('Contact request deleted');
      fetchData();
    } catch (error) {
      showError('Failed to delete contact');
    }
  };

  const handleUpdateContactStatus = async (id, status) => {
    try {
      await api.put(`/contacts/admin/${id}`, { status });
      showSuccess(`Status updated to ${status}`);
      fetchData();
    } catch (error) {
      showError('Failed to update status');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600">Manage Blogs, FAQs, and Get In Touch requests</p>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} className="px-4 py-2 rounded-lg bg-gray-800 text-white">Back</button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('blogs')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'blogs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Blogs
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'faqs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            FAQs
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'contacts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Get In Touch
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div>
            {/* BLOGS VIEW */}
            {activeTab === 'blogs' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Blogs Content</h2>
                  <button onClick={handleToggleBlogForm} className="px-4 py-2 bg-blue-600 text-white rounded shadow text-sm">
                    {showBlogForm ? 'Cancel' : '+ Add Blog'}
                  </button>
                </div>

                {showBlogForm && (
                  <form onSubmit={handleBlogSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-4">
                    {editingBlogId && (
                      <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                        Editing existing blog post
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium">Title</label>
                        <input required value={blogForm.title} onChange={e => setBlogForm({...blogForm, title: e.target.value})} className="mt-1 w-full border rounded p-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Author</label>
                        <input required value={blogForm.author} onChange={e => setBlogForm({...blogForm, author: e.target.value})} className="mt-1 w-full border rounded p-2" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Excerpt</label>
                      <textarea required value={blogForm.excerpt} onChange={e => setBlogForm({...blogForm, excerpt: e.target.value})} className="mt-1 w-full border rounded p-2" rows={2}></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Content</label>
                      <textarea required value={blogForm.content} onChange={e => setBlogForm({...blogForm, content: e.target.value})} className="mt-1 w-full border rounded p-2" rows={4}></textarea>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium">Image</label>
                        <input type="file" accept="image/*" onChange={e => setBlogForm({...blogForm, image: e.target.files[0]})} className="mt-1" />
                      </div>
                      <div className="flex items-center mt-5">
                        <input type="checkbox" id="published" checked={blogForm.published} onChange={e => setBlogForm({...blogForm, published: e.target.checked})} className="mr-2" />
                        <label htmlFor="published" className="text-sm font-medium">Published</label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                        {editingBlogId ? 'Update Blog' : 'Submit'}
                      </button>
                      {editingBlogId && (
                        <button type="button" onClick={handleCancelBlogEdit} className="px-4 py-2 bg-gray-200 text-gray-800 rounded">
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {blogs.map(blog => (
                        <tr key={blog.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{blog.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{blog.author}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {blog.published ? <span className="text-green-600">Published</span> : <span className="text-yellow-600">Draft</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="inline-flex items-center gap-3">
                              <button onClick={() => handleEditBlog(blog)} className="text-blue-600 hover:text-blue-900">Edit</button>
                              <button onClick={() => handleDeleteBlog(blog.id)} className="text-red-600 hover:text-red-900">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {blogs.length === 0 && <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No blogs found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FAQS VIEW */}
            {activeTab === 'faqs' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">FAQs Content</h2>
                  <button onClick={() => setShowFaqForm(!showFaqForm)} className="px-4 py-2 bg-blue-600 text-white rounded shadow text-sm">
                    {showFaqForm ? 'Cancel' : '+ Add FAQ'}
                  </button>
                </div>

                {showFaqForm && (
                  <form onSubmit={handleFaqSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium">Category</label>
                        <input required value={faqForm.category} onChange={e => setFaqForm({...faqForm, category: e.target.value})} className="mt-1 w-full border rounded p-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Order</label>
                        <input type="number" value={faqForm.order} onChange={e => setFaqForm({...faqForm, order: e.target.value})} className="mt-1 w-full border rounded p-2" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Question</label>
                      <input required value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} className="mt-1 w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Answer</label>
                      <textarea required value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} className="mt-1 w-full border rounded p-2" rows={3}></textarea>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Submit</button>
                  </form>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {faqs.map(faq => (
                        <tr key={faq.id}>
                          <td className="px-6 py-4 text-sm text-gray-900"><div className="truncate max-w-sm">{faq.question}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{faq.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleDeleteFaq(faq.id)} className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {faqs.length === 0 && <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No FAQs found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CONTACTS VIEW */}
            {activeTab === 'contacts' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Get In Touch Requests</h2>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {contacts.map(contact => (
                        <tr key={contact.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{contact.email}</div>
                            <div>{contact.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="font-semibold">{contact.subject}</div>
                            <div className="line-clamp-2 max-w-xs">{contact.message}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <select 
                              value={contact.status} 
                              onChange={(e) => handleUpdateContactStatus(contact.id, e.target.value)}
                              className="border rounded px-2 py-1 bg-gray-50"
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleDeleteContact(contact.id)} className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {contacts.length === 0 && <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No contact requests found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
