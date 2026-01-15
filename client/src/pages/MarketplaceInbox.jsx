import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarketplaceHeader from '../components/MarketplaceHeader';
import { useAuth } from '../hooks/useAuth';

export default function MarketplaceInbox() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Load messages
  useEffect(() => {
    if (isAuthenticated && user) {
      loadMessages();
    }
  }, [isAuthenticated, user]);

  const loadMessages = () => {
    try {
      const storageKey = `marketplace_inbox_${user?.email}`;
      const savedMessages = localStorage.getItem(storageKey);
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Sort by date, newest first
        const sorted = parsedMessages.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setMessages(sorted);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    // Mark as read
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  const markAsRead = (messageId) => {
    try {
      const storageKey = `marketplace_inbox_${user?.email}`;
      const updatedMessages = messages.map((msg) =>
        msg.id === messageId ? { ...msg, read: true } : msg
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleReply = () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }

    // TODO: Connect to backend API
    console.log('Sending reply:', {
      to: selectedMessage.fromEmail,
      from: user?.email,
      listingId: selectedMessage.listingId,
      message: replyText,
    });

    alert('Reply sent! (This is a UI preview - connect to backend when ready)');
    setReplyText('');
  };

  const handleDelete = (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const storageKey = `marketplace_inbox_${user?.email}`;
      const updatedMessages = messages.filter((msg) => msg.id !== messageId);
      localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (loading || !isAuthenticated) {
    return null;
  }

  const unreadCount = messages.filter((msg) => !msg.read).length;

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="bg-white">
        <MarketplaceHeader
          userName={user?.name}
          userEmail={user?.email}
          onSearchChange={(value) => {
            console.log('Marketplace search:', value);
          }}
          onCategorySelect={(category) => {
            console.log('Marketplace category:', category);
          }}
          onSellClick={() => {
            console.log('Sell clicked');
          }}
        />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/marketplace/profile')}
            className="flex items-center gap-2 text-gray-600 hover:text-dark-brown transition-colors mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-paragraph text-sm">Back to Profile</span>
          </button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="font-heading text-2xl text-dark-brown mb-2">Inbox</h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No unread messages'}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="font-heading text-lg text-dark-brown mb-2">No messages yet</h3>
              <p className="text-sm text-gray-500">
                Messages from buyers about your listings will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Messages List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">Messages</p>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                    {messages.map((message) => (
                      <button
                        key={message.id}
                        onClick={() => handleMessageClick(message)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          selectedMessage?.id === message.id ? 'bg-gray-50' : ''
                        } ${!message.read ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-dark-brown truncate">
                                {message.fromName || message.fromEmail}
                              </p>
                              {!message.read && (
                                <span className="w-2 h-2 bg-accent-red rounded-full flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mb-1">
                              {message.listingTitle}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message Detail */}
              <div className="lg:col-span-2">
                {selectedMessage ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    {/* Message Header */}
                    <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100">
                      <div className="flex-1">
                        <h2 className="font-heading text-xl text-dark-brown mb-2">
                          {selectedMessage.fromName || selectedMessage.fromEmail}
                        </h2>
                        <p className="text-sm text-gray-500 mb-1">
                          {selectedMessage.fromEmail}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(selectedMessage.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <p className="text-sm text-gray-500 mb-3">About this item:</p>
                      <div className="flex gap-4">
                        {selectedMessage.listingImage && (
                          <img
                            src={selectedMessage.listingImage}
                            alt={selectedMessage.listingTitle}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-dark-brown mb-1">
                            {selectedMessage.listingTitle}
                          </p>
                          <p className="text-sm text-gray-500 mb-1">
                            ₹{parseFloat(selectedMessage.listingPrice).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-400 mb-2">
                            {selectedMessage.listingCategory}
                          </p>
                          <button
                            onClick={() => navigate(`/marketplace/listing/${selectedMessage.listingId}`)}
                            className="text-xs text-accent-red hover:underline"
                          >
                            View Listing →
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-500 mb-2">Message:</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-dark-brown whitespace-pre-wrap">
                          {selectedMessage.message}
                        </p>
                      </div>
                    </div>

                    {/* Reply Section */}
                    <div className="border-t border-gray-100 pt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reply to {selectedMessage.fromName || selectedMessage.fromEmail}
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows="4"
                        placeholder="Type your reply..."
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-red/70 focus:border-accent-red resize-none mb-3"
                      />
                      <button
                        onClick={handleReply}
                        className="px-6 py-2.5 text-sm font-paragraph rounded-lg bg-accent-red text-white hover:bg-accent-red/90 transition-colors"
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="text-gray-500">Select a message to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

