import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';
import { useNotification } from '../components/NotificationProvider';
import { API_BASE } from '../config';

export default function AdminSupport() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // State for different sections
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // State for FAQ management
  const [faqs, setFaqs] = useState([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '' });
  const [editingFaq, setEditingFaq] = useState(null);
  
  // State for Blog management
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', author: '', published: false });
  const [editingBlog, setEditingBlog] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // State for Contact management
  const [contacts, setContacts] = useState([]);
  const [contactStats, setContactStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
    high: 0
  });
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [contactFilters, setContactFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });

  useEffect(() => {
    fetchFAQs();
    fetchBlogs();
    fetchContacts();
    fetchContactStats();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE + '/faqs/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
      } else {
        showError('Failed to fetch FAQs');
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      showError('Error fetching FAQs');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE + '/blogs/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      } else {
        showError('Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      showError('Error fetching blogs');
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (contactFilters.status) queryParams.append('status', contactFilters.status);
      if (contactFilters.priority) queryParams.append('priority', contactFilters.priority);
      if (contactFilters.category) queryParams.append('category', contactFilters.category);

      const response = await fetch(`${API_BASE}/contacts/admin?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      } else {
        showError('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showError('Error fetching contacts');
    }
  };

  const fetchContactStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE + '/contacts/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContactStats(data.stats || contactStats);
      } else {
        showError('Failed to fetch contact statistics');
      }
    } catch (error) {
      console.error('Error fetching contact stats:', error);
      showError('Error fetching contact statistics');
    }
  };

  // Contact management functions
  const handleContactStatusChange = async (contactId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contacts/admin/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showSuccess('Contact status updated successfully');
        fetchContacts();
        fetchContactStats();
      } else {
        showError('Failed to update contact status');
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
      showError('Error updating contact status');
    }
  };

  const handleContactPriorityChange = async (contactId, newPriority) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contacts/admin/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priority: newPriority })
      });

      if (response.ok) {
        showSuccess('Contact priority updated successfully');
        fetchContacts();
        fetchContactStats();
      } else {
        showError('Failed to update contact priority');
      }
    } catch (error) {
      console.error('Error updating contact priority:', error);
      showError('Error updating contact priority');
    }
  };

  const handleReplyToContact = async (contactId) => {
    if (!replyMessage.trim()) {
      showError('Please enter a reply message');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contacts/admin/${contactId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyMessage })
      });

      if (response.ok) {
        showSuccess('Reply sent successfully');
        setReplyMessage('');
        setSelectedContact(null);
        fetchContacts();
        fetchContactStats();
      } else {
        showError('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      showError('Error sending reply');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contacts/admin/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showSuccess('Contact deleted successfully');
        fetchContacts();
        fetchContactStats();
      } else {
        showError('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      showError('Error deleting contact');
    }
  };

  const handleContactFilterChange = (filterType, value) => {
    setContactFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Refetch contacts when filters change
  useEffect(() => {
    fetchContacts();
  }, [contactFilters]);

  // FAQ Management Functions
  const addFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim() || !newFaq.category.trim()) {
      showError('Please fill in category, question, and answer');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE + '/faqs/admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFaq)
      });

      if (response.ok) {
        const data = await response.json();
        setFaqs(prev => [...prev, data.faq]);
        setNewFaq({ question: '', answer: '', category: '' });
        showSuccess('FAQ added successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Failed to add FAQ');
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
      showError('Error adding FAQ');
    }
  };

  const editFaq = (faq) => {
    setEditingFaq(faq);
    setNewFaq({ question: faq.question, answer: faq.answer, category: faq.category });
  };

  const updateFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim() || !newFaq.category.trim()) {
      showError('Please fill in category, question, and answer');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/faqs/admin/${editingFaq.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFaq)
      });

      if (response.ok) {
        const data = await response.json();
        setFaqs(prev => prev.map(faq => 
          faq.id === editingFaq.id ? data.faq : faq
        ));
        setEditingFaq(null);
        setNewFaq({ question: '', answer: '', category: '' });
        showSuccess('FAQ updated successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Failed to update FAQ');
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      showError('Error updating FAQ');
    }
  };

  const deleteFaq = async (faqId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/faqs/admin/${faqId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setFaqs(prev => prev.filter(faq => faq.id !== faqId));
        showSuccess('FAQ deleted successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      showError('Error deleting FAQ');
    }
  };

  // Blog Management Functions
  const addBlog = async () => {
    if (!newBlog.title.trim() || !newBlog.content.trim() || !newBlog.author.trim()) {
      showError('Please fill in title, content, and author');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Add blog data
      formData.append('title', newBlog.title);
      formData.append('content', newBlog.content);
      formData.append('author', newBlog.author);
      formData.append('published', newBlog.published);
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(API_BASE + '/blogs/admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setBlogs(prev => [...prev, data.blog]);
        setNewBlog({ title: '', content: '', author: '', published: false });
        setSelectedImage(null);
        setImagePreview(null);
        showSuccess('Blog added successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Failed to add blog');
      }
    } catch (error) {
      console.error('Error adding blog:', error);
      showError('Error adding blog');
    }
  };

  const editBlog = (blog) => {
    setEditingBlog(blog);
    setNewBlog({ 
      title: blog.title, 
      content: blog.content, 
      author: blog.author,
      published: blog.published
    });
    setSelectedImage(null);
    setImagePreview(blog.imageUrl || null);
  };

  const updateBlog = async () => {
    if (!newBlog.title.trim() || !newBlog.content.trim() || !newBlog.author.trim()) {
      showError('Please fill in title, content, and author');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Add blog data
      formData.append('title', newBlog.title);
      formData.append('content', newBlog.content);
      formData.append('author', newBlog.author);
      formData.append('published', newBlog.published);
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`${API_BASE}/blogs/admin/${editingBlog.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setBlogs(prev => prev.map(blog => 
          blog.id === editingBlog.id ? data.blog : blog
        ));
        setEditingBlog(null);
        setNewBlog({ title: '', content: '', author: '', published: false });
        setSelectedImage(null);
        setImagePreview(null);
        showSuccess('Blog updated successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Failed to update blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      showError('Error updating blog');
    }
  };

  const deleteBlog = async (blogId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/blogs/admin/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setBlogs(prev => prev.filter(blog => blog.id !== blogId));
        showSuccess('Blog deleted successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      showError('Error deleting blog');
    }
  };

  // Image handling functions
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Contact Management Functions
  const updateContactInfo = () => {
    showSuccess('Contact information updated successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Support & Communication</h1>
              <p className="mt-2 text-gray-600">Manage FAQ, Blog posts, and Contact information</p>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveSection('faq')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'faq'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  FAQ Management
                </button>
                <button
                  onClick={() => setActiveSection('blog')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'blog'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Blog Management
                </button>
                <button
                  onClick={() => setActiveSection('contact')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'contact'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Contact Us
                </button>
              </nav>
            </div>

            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">FAQ Items</p>
                      <p className="text-2xl font-semibold text-gray-900">{faqs.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Blog Posts</p>
                      <p className="text-2xl font-semibold text-gray-900">{blogs.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Contact Info</p>
                      <p className="text-2xl font-semibold text-gray-900">Updated</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Management Section */}
            {activeSection === 'faq' && (
              <div className="space-y-6">
                {/* Add/Edit FAQ Form */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={newFaq.category}
                        onChange={(e) => setNewFaq(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a category</option>
                        <option value="Shipping & Delivery">Shipping & Delivery</option>
                        <option value="Returns & Exchanges">Returns & Exchanges</option>
                        <option value="Product Information">Product Information</option>
                        <option value="Payment & Billing">Payment & Billing</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                      <input
                        type="text"
                        value={newFaq.question}
                        onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                        placeholder="Enter the question..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                      <textarea
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                        placeholder="Enter the answer..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={editingFaq ? updateFaq : addFaq}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {editingFaq ? 'Update FAQ' : 'Add FAQ'}
                      </button>
                      {editingFaq && (
                        <button
                          onClick={() => {
                            setEditingFaq(null);
                            setNewFaq({ question: '', answer: '', category: '' });
                          }}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* FAQ List */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">FAQ List</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {faqs.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        No FAQ items yet. Add your first FAQ above.
                      </div>
                    ) : (
                      faqs.map((faq) => (
                        <div key={faq.id} className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {faq.category}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  faq.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {faq.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                              <p className="text-gray-700">{faq.answer}</p>
                              <p className="text-sm text-gray-500 mt-2">
                                Created: {new Date(faq.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="ml-4 flex space-x-2">
                              <button
                                onClick={() => editFaq(faq)}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteFaq(faq.id)}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Blog Management Section */}
            {activeSection === 'blog' && (
              <div className="space-y-6">
                {/* Add/Edit Blog Form */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={newBlog.title}
                        onChange={(e) => setNewBlog(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter blog title..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                      <input
                        type="text"
                        value={newBlog.author}
                        onChange={(e) => setNewBlog(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="Enter author name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <textarea
                        value={newBlog.content}
                        onChange={(e) => setNewBlog(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Enter blog content..."
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blog Image</label>
                      <div className="space-y-4">
                        {/* Image Upload */}
                        <div className="flex items-center space-x-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {imagePreview && (
                            <button
                              type="button"
                              onClick={removeImage}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Remove Image
                            </button>
                          )}
                        </div>
                        
                        {/* Image Preview */}
                        {imagePreview && (
                          <div className="mt-4">
                            <img
                              src={imagePreview}
                              alt="Blog preview"
                              className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="published"
                        checked={newBlog.published}
                        onChange={(e) => setNewBlog(prev => ({ ...prev, published: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                        Publish immediately
                      </label>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={editingBlog ? updateBlog : addBlog}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {editingBlog ? 'Update Blog' : 'Add Blog Post'}
                      </button>
                      {editingBlog && (
                        <button
                          onClick={() => {
                            setEditingBlog(null);
                            setNewBlog({ title: '', content: '', author: '', published: false });
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Blog List */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Blog Posts</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {blogs.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        No blog posts yet. Add your first blog post above.
                      </div>
                    ) : (
                      blogs.map((blog) => (
                        <div key={blog.id} className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">{blog.title}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  blog.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {blog.published ? 'Published' : 'Draft'}
                                </span>
                                {blog.category && (
                                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    {blog.category}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 mb-2">{blog.excerpt || blog.content.substring(0, 200)}...</p>
                              {blog.imageUrl && (
                                <div className="mb-2">
                                  <img
                                    src={blog.imageUrl}
                                    alt={blog.title}
                                    className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                                  />
                                </div>
                              )}
                              <div className="text-sm text-gray-500">
                                <p>Author: {blog.author}</p>
                                <p>Created: {new Date(blog.createdAt).toLocaleDateString()}</p>
                                {blog.publishedAt && (
                                  <p>Published: {new Date(blog.publishedAt).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                            <div className="ml-4 flex space-x-2">
                              <button
                                onClick={() => editBlog(blog)}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteBlog(blog.id)}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Us Section */}
            {activeSection === 'contact' && (
              <div className="space-y-6">
                {/* Contact Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">Total</p>
                        <p className="text-xl font-semibold text-gray-900">{contactStats.total}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">New</p>
                        <p className="text-xl font-semibold text-gray-900">{contactStats.new}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">In Progress</p>
                        <p className="text-xl font-semibold text-gray-900">{contactStats.inProgress}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">Urgent</p>
                        <p className="text-xl font-semibold text-gray-900">{contactStats.urgent}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Contacts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={contactFilters.status}
                        onChange={(e) => handleContactFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Status</option>
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={contactFilters.priority}
                        onChange={(e) => handleContactFilterChange('priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={contactFilters.category}
                        onChange={(e) => handleContactFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Categories</option>
                        <option value="general">General</option>
                        <option value="support">Support</option>
                        <option value="sales">Sales</option>
                        <option value="complaint">Complaint</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contacts List */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Inquiries</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {contacts.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        No contacts found
                      </div>
                    ) : (
                      contacts.map((contact) => (
                        <div key={contact.id} className="p-6 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{contact.name}</h4>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  contact.status === 'new' ? 'bg-green-100 text-green-800' :
                                  contact.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  contact.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {contact.status.replace('_', ' ')}
                                </span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  contact.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                  contact.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                  contact.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {contact.priority}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                <p><strong>Email:</strong> {contact.email}</p>
                                <p><strong>Phone:</strong> {contact.phone}</p>
                                <p><strong>Subject:</strong> {contact.subject}</p>
                                <p><strong>Category:</strong> {contact.category}</p>
                                <p><strong>Date:</strong> {new Date(contact.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-700">{contact.message}</p>
                              </div>
                              {contact.adminReply && (
                                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                  <p className="text-sm font-medium text-blue-900 mb-1">Admin Reply:</p>
                                  <p className="text-sm text-blue-800">{contact.adminReply.message}</p>
                                  <p className="text-xs text-blue-600 mt-1">
                                    Replied by {contact.adminReply.repliedBy?.name} on {new Date(contact.adminReply.repliedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2 ml-4">
                              <div className="flex space-x-2">
                                <select
                                  value={contact.status}
                                  onChange={(e) => handleContactStatusChange(contact.id, e.target.value)}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="new">New</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="resolved">Resolved</option>
                                  <option value="closed">Closed</option>
                                </select>
                                <select
                                  value={contact.priority}
                                  onChange={(e) => handleContactPriorityChange(contact.id, e.target.value)}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                  <option value="urgent">Urgent</option>
                                </select>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setSelectedContact(contact)}
                                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Reply
                                </button>
                                <button
                                  onClick={() => handleDeleteContact(contact.id)}
                                  className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Reply Modal */}
                {selectedContact && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Reply to {selectedContact.name}
                      </h3>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Subject:</strong> {selectedContact.subject}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Message:</strong> {selectedContact.message}
                        </p>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Reply
                        </label>
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Type your reply here..."
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setSelectedContact(null);
                            setReplyMessage('');
                          }}
                          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReplyToContact(selectedContact.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Send Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

