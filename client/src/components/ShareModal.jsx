import React, { useState } from 'react';
import { useNotification } from './NotificationProvider';

const SHARE_PLATFORMS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    color: 'bg-[#25D366] hover:bg-[#20bd5a]',
    href: (url) => `https://wa.me/?text=${encodeURIComponent(url)}`,
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    )
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: 'bg-[#1877F2] hover:bg-[#166fe5]',
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )
  },
  {
    id: 'messenger',
    name: 'Messenger',
    color: 'bg-gradient-to-br from-[#00B2FF] to-[#006AFF] hover:opacity-90',
    href: (url) => `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=966242223397117&redirect_uri=${encodeURIComponent(url)}`,
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.36 2 2 6.13 2 11.37c0 3.92 2.24 7.35 5.56 9.19.3.15.49.49.49.85v2.16c0 .62.69 1.01 1.23.68l2.45-1.68c.65.09 1.32.14 2.03.14 5.64 0 10-4.13 10-9.37S17.64 2 12 2zm.94 12.54l-2.68-2.84-5.26 2.84 5.8-6.12 2.63 2.84 5.3-2.84-5.79 6.12z" />
      </svg>
    )
  },
  {
    id: 'twitter',
    name: 'Twitter',
    color: 'bg-[#1DA1F2] hover:bg-[#1a94da]',
    href: (url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    id: 'gmail',
    name: 'Gmail',
    color: 'bg-[#EA4335] hover:bg-[#d93a2d]',
    href: (url, title = '') => {
      const subject = title ? encodeURIComponent(title) : encodeURIComponent('Check out this product');
      const body = encodeURIComponent(`${title ? title + '\n\n' : ''}${url}`);
      return `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
    },
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L2.455 4.64 12 9.548l9.545-4.91 1.528 1.853C24.231 5.457 24 5.457 24 5.457z" />
      </svg>
    )
  }
];

export default function ShareModal({ isOpen, onClose, shareUrl, shareTitle = '' }) {
  const { showSuccess } = useNotification();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || '');
      setCopied(true);
      showSuccess('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showSuccess('Copy failed. Please select and copy manually.');
    }
  };

  const openShare = (platform) => {
    const url = typeof platform.href === 'function'
      ? platform.href(shareUrl || '', shareTitle)
      : platform.href(shareUrl || '');
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Share With Your Family & Friends</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Shareable link + Copy */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            readOnly
            value={shareUrl || ''}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-gray-50"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors whitespace-nowrap"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Social platforms */}
        <div className="flex flex-wrap justify-center gap-6">
          {SHARE_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              type="button"
              onClick={() => openShare(platform)}
              className="flex flex-col items-center gap-2 group"
            >
              <span
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${platform.color}`}
              >
                {platform.icon}
              </span>
              <span className="text-xs font-medium text-gray-600">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
