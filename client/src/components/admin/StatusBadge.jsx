import React from 'react';

const TONES = {
  green: 'bg-green-100 text-green-800 border-green-200',
  amber: 'bg-amber-100 text-amber-900 border-amber-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

/**
 * Shared status pill for admin UI (account, orders, enquiries, etc.)
 */
export default function StatusBadge({ tone = 'gray', children, className = '' }) {
  const cls = TONES[tone] || TONES.gray;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${cls} ${className}`}
    >
      {children}
    </span>
  );
}

/** Map raw account status from API to display label + tone */
export function accountStatusDisplay(status) {
  const s = status || 'active';
  if (s === 'banned') return { label: 'Banned', tone: 'red' };
  if (s === 'suspended' || s === 'inactive') return { label: 'Suspended', tone: 'amber' };
  return { label: 'Active', tone: 'green' };
}

/** Filter pill grouping for list page */
export function accountStatusFilterGroup(status) {
  const s = status || 'active';
  if (s === 'banned') return 'banned';
  if (s === 'suspended' || s === 'inactive') return 'suspended';
  return 'active';
}

export function orderStatusTone(status) {
  switch (status) {
    case 'Delivered':
      return 'green';
    case 'Cancelled':
      return 'red';
    case 'Pending':
      return 'yellow';
    case 'Processing':
    case 'Shipped':
      return 'blue';
    default:
      return 'gray';
  }
}
