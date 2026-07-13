import React, { useMemo, useState, useEffect } from 'react';
import api from '../../../api/axios';
import { API_BASE } from '../../../config';
import StatusBadge, {
  accountStatusDisplay,
  accountStatusFilterGroup,
} from '../StatusBadge';
import { Link } from 'react-router-dom';

export default function UsersModal({ showUsersModal, setShowUsersModal, detailedData }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [userCart, setUserCart] = useState(null);
  const [userWishlist, setUserWishlist] = useState([]);
  const [customerAnalytics, setCustomerAnalytics] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
    customersWithOrders: 0,
    averageOrderValue: 0,
    topCustomers: []
  });

  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewErrors, setOverviewErrors] = useState({});
  const [serviceEnquiries, setServiceEnquiries] = useState([]);
  const [generalEnquiries, setGeneralEnquiries] = useState([]);
  const [afterSaleRequests, setAfterSaleRequests] = useState([]);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [neverOrderedOpen, setNeverOrderedOpen] = useState(false);

  useEffect(() => {
    if (showUsersModal) {
      fetchCustomerOverview();
    }
  }, [showUsersModal]);

  const fetchCustomerOverview = async () => {
    setOverviewLoading(true);
    setOverviewErrors({});
    try {
      const results = await Promise.allSettled([
        api.get('/admin/users'),
        api.get('/admin/enquiries'),
        api.get('/services/admin/enquiries'),
        api.get('/admin/after-sale?limit=100&page=1'),
        api.get('/reviews/admin/all', { params: { status: 'Pending' } }),
      ]);

      const [usersRes, genEnqRes, svcEnqRes, afterSaleRes, pendingReviewsRes] = results;

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data?.users || []);
      } else {
        setOverviewErrors((p) => ({ ...p, users: 'Failed to load' }));
        // Fallback to detailedData if available
        if (detailedData?.users) {
          setUsers(detailedData.users.filter((u) => !u.role || u.role === 'customer'));
        }
      }

      if (genEnqRes.status === 'fulfilled') {
        setGeneralEnquiries(Array.isArray(genEnqRes.value.data) ? genEnqRes.value.data : (genEnqRes.value.data?.enquiries || []));
      } else {
        setOverviewErrors((p) => ({ ...p, generalEnquiries: 'Failed to load' }));
        setGeneralEnquiries([]);
      }

      if (svcEnqRes.status === 'fulfilled') {
        setServiceEnquiries(svcEnqRes.value.data?.enquiries || []);
      } else {
        setOverviewErrors((p) => ({ ...p, serviceEnquiries: 'Failed to load' }));
        setServiceEnquiries([]);
      }

      if (afterSaleRes.status === 'fulfilled') {
        setAfterSaleRequests(afterSaleRes.value.data?.requests || []);
      } else {
        setOverviewErrors((p) => ({ ...p, afterSale: 'Failed to load' }));
        setAfterSaleRequests([]);
      }

      if (pendingReviewsRes.status === 'fulfilled') {
        const reviews = pendingReviewsRes.value.data?.reviews || [];
        setPendingReviewsCount(Array.isArray(reviews) ? reviews.length : 0);
      } else {
        setOverviewErrors((p) => ({ ...p, pendingReviews: 'Failed to load' }));
        setPendingReviewsCount(null);
      }

      setLastUpdatedAt(new Date());
    } catch (e) {
      setOverviewErrors((p) => ({ ...p, overview: e.message || 'Failed to load' }));
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      
      // Fetch user orders
      const ordersResponse = await api.get(`/admin/users/${userId}/orders`);
      setUserOrders(ordersResponse.data.orders || []);
      
      // Fetch user cart
      const cartResponse = await api.get(`/admin/users/${userId}/cart`);
      setUserCart(cartResponse.data.cart || null);
      
      // Fetch user wishlist
      const wishlistResponse = await api.get(`/admin/users/${userId}/wishlist`);
      setUserWishlist(wishlistResponse.data.wishlist || []);
      
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserProfile = async (user) => {
    setSelectedUser(user);
    setShowUserProfile(true);
    await fetchUserDetails(user._id);
  };

  const fetchUsers = async () => {
    // Backwards-compatible refresh hook used by existing UI
    await fetchCustomerOverview();
  };

  // const fetchUserOrders = async (userId) => {
  //   try {
  //     const response = await api.get(`/admin/users/${userId}/orders`);
  //     setUserOrders(response.data.orders || []);
  //   } catch (error) {
  //     console.error('Error fetching user orders:', error);
  //     setUserOrders([]);
  //   }
  // };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const isActive = currentStatus === 'active';
      const newStatus = isActive ? 'suspended' : 'active';
      await api.patch(`/admin/users/${userId}/status`, {
        status: newStatus,
        reason: isActive
          ? 'Account suspended from admin dashboard overview'
          : 'Account activated from admin dashboard overview',
      });
      fetchCustomerOverview();
      setSelectedUser((prev) =>
        prev && prev._id === userId ? { ...prev, status: newStatus } : prev
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // const handleViewProfile = (user) => {
  //   setSelectedUser(user);
  //   setShowUserProfile(true);
  //   fetchUserOrders(user._id);
  // };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const group = accountStatusFilterGroup(user.status);
    const matchesStatus = statusFilter === 'all' || statusFilter === group;
    return matchesSearch && matchesStatus && (!user.role || user.role === 'customer');
  });

  // Debug logging
  console.log('UsersModal Debug:', {
    users,
    filteredUsers,
    searchTerm,
    statusFilter,
    loading
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDDMMMYYYY = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatFeedTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const metrics = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const days30Ago = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const hours24Ago = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const days7Ago = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const customers = (users || []).filter((u) => !u.role || u.role === 'customer');
    const totalCustomers = customers.length;

    const newThisMonth = customers.filter((u) => new Date(u.createdAt) >= thisMonthStart).length;
    const newLastMonth = customers.filter((u) => {
      const d = new Date(u.createdAt);
      return d >= lastMonthStart && d <= lastMonthEnd;
    }).length;
    const diff = newThisMonth - newLastMonth;

    // Active = order placed OR enquiry submitted in last 30 days
    const activeByOrder = new Set(
      customers
        .filter((u) => u.lastOrderDate && new Date(u.lastOrderDate) >= days30Ago)
        .map((u) => String(u._id))
    );
    const activeByGeneralEnquiry = new Set(
      (generalEnquiries || [])
        .filter((e) => e?.user && e.createdAt && new Date(e.createdAt) >= days30Ago)
        .map((e) => String(e.user))
    );
    const activeByServiceEnquiry = new Set(
      (serviceEnquiries || [])
        .filter((e) => e?.customerId && e.createdAt && new Date(e.createdAt) >= days30Ago)
        .map((e) => String(e.customerId?._id || e.customerId))
    );
    const activeCustomers = new Set([
      ...activeByOrder,
      ...activeByGeneralEnquiry,
      ...activeByServiceEnquiry,
    ]).size;

    const flagged = customers.filter((u) => ['suspended', 'banned', 'inactive'].includes(u.status)).length;

    const isServiceOpen = (status) => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(status);
    const isAfterSaleOpen = (status) => !['completed', 'closed'].includes(status);

    const overdueGeneral = (generalEnquiries || []).filter((e) => {
      if (!e?.createdAt) return false;
      // general enquiries don't have completed/closed; treat rejected/converted as closed
      if (['Rejected', 'Converted to Order'].includes(e.status)) return false;
      return new Date(e.createdAt) < hours24Ago;
    });
    const overdueService = (serviceEnquiries || []).filter((e) => {
      if (!e?.createdAt) return false;
      if (!isServiceOpen(e.status)) return false;
      return new Date(e.createdAt) < hours24Ago;
    });
    const enquiriesBreaching24h = overdueGeneral.length + overdueService.length;

    const overdueAfterSale = (afterSaleRequests || []).filter((r) => {
      if (!r?.createdAt) return false;
      if (!isAfterSaleOpen(r.status)) return false;
      return new Date(r.createdAt) < days7Ago;
    });

    const lowSatisfaction = (afterSaleRequests || []).filter((r) => {
      if (r?.status !== 'completed') return false;
      const rating = r?.feedback?.rating;
      if (rating == null) return false;
      if (!(rating === 1 || rating === 2)) return false;
      if (!r?.feedback?.submittedAt && !r?.updatedAt && !r?.createdAt) return true;
      const t = r.feedback.submittedAt || r.updatedAt || r.createdAt;
      return new Date(t) >= days30Ago;
    });
    const unhappyCustomersCount = new Set(
      lowSatisfaction
        .map((r) => String(r.customerId?._id || r.customerId))
        .filter(Boolean)
    ).size;

    const pendingReviews = pendingReviewsCount ?? 0;

    const topCustomers = [...customers]
      .map((u) => ({
        ...u,
        orderCount: u.orderCount ?? 0,
        lifetimeSpend: u.lifetimeSpend ?? 0,
        lastOrderDate: u.lastOrderDate ?? null,
      }))
      .sort((a, b) => Number(b.lifetimeSpend || 0) - Number(a.lifetimeSpend || 0))
      .slice(0, 5);

    const signupEvents = customers
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((u) => ({
        type: 'signup',
        icon: '👤',
        color: 'bg-blue-100 text-blue-700',
        at: u.createdAt,
        userId: u._id,
        text: `${u.name} signed up`,
      }));

    const statusEvents = customers
      .filter((u) => (u.lastStatusEvent && (u.status === 'suspended' || u.status === 'banned')) || false)
      .map((u) => ({
        type: 'status',
        icon: '⚠️',
        color: 'bg-red-100 text-red-700',
        at: u.lastStatusEvent?.createdAt,
        userId: u._id,
        text: u.lastStatusEvent?.description || `Account marked ${u.status}`,
      }));

    const svcEvents = (serviceEnquiries || []).slice(0, 10).map((e) => ({
      type: 'service_enquiry',
      icon: '💬',
      color: 'bg-teal-100 text-teal-700',
      at: e.createdAt,
      userId: e.customerId?._id || e.customerId,
      text: `${e.customerId?.name || 'Customer'} submitted a service enquiry`,
    }));

    const afterSaleEvents = (afterSaleRequests || []).slice(0, 10).map((r) => ({
      type: 'after_sale',
      icon: '🛠️',
      color: 'bg-amber-100 text-amber-800',
      at: r.createdAt,
      userId: r.customerId?._id || r.customerId,
      text: `${r.customerId?.name || 'Customer'} submitted an after-sale request`,
    }));

    const lowRatingEvents = lowSatisfaction.slice(0, 10).map((r) => ({
      type: 'low_rating',
      icon: '★',
      color: 'bg-red-100 text-red-700',
      at: r.feedback?.submittedAt || r.updatedAt || r.createdAt,
      userId: r.customerId?._id || r.customerId,
      text: `${r.customerId?.name || 'Customer'} left a low rating (${r.feedback?.rating}★)`,
    }));

    // TODO: replace with unified activity endpoint when available
    const feed = [...signupEvents, ...statusEvents, ...svcEvents, ...afterSaleEvents, ...lowRatingEvents]
      .filter((x) => x.at)
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 10);

    const neverOrdered = [...customers]
      .filter((u) => (u.orderCount ?? 0) === 0)
      .map((u) => ({
        ...u,
        daysSince: Math.max(0, Math.floor((Date.now() - new Date(u.createdAt).getTime()) / (24 * 60 * 60 * 1000))),
      }))
      .sort((a, b) => b.daysSince - a.daysSince);

    return {
      totalCustomers,
      newThisMonth,
      newLastMonth,
      diff,
      activeCustomers,
      flagged,
      enquiriesBreaching24h,
      overdueAfterSaleCount: overdueAfterSale.length,
      unhappyCustomersCount,
      pendingReviews,
      topCustomers,
      feed,
      neverOrdered,
    };
  }, [users, generalEnquiries, serviceEnquiries, afterSaleRequests, pendingReviewsCount]);

  if (!showUsersModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600">Manage customer accounts and view their activity</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowUsersModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          {/* Customer overview heading + last updated */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Customer overview</h3>
              <p className="text-sm text-gray-600">
                Last updated: {lastUpdatedAt ? formatFeedTime(lastUpdatedAt) : '—'}
              </p>
            </div>
            <button
              onClick={fetchCustomerOverview}
              className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              disabled={overviewLoading}
            >
              {overviewLoading ? 'Refreshing…' : 'Refresh overview'}
            </button>
          </div>

          {/* 1. Stat cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Total customers</div>
              {overviewErrors.users ? (
                <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  Failed to load <button className="underline" onClick={fetchCustomerOverview}>Retry</button>
                </div>
              ) : overviewLoading ? (
                <div className="mt-2 h-8 bg-gray-200 rounded animate-pulse" />
              ) : (
                <div className="mt-1 text-2xl font-semibold text-gray-900">{metrics.totalCustomers}</div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-600">New this month</div>
              {overviewLoading ? (
                <div className="mt-2 h-8 bg-gray-200 rounded animate-pulse" />
              ) : (
                <>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{metrics.newThisMonth}</div>
                  <div className="mt-1 text-xs">
                    {metrics.diff > 0 ? (
                      <span className="text-green-700 font-medium">↑ +{metrics.diff} vs last month</span>
                    ) : metrics.diff < 0 ? (
                      <span className="text-red-700 font-medium">↓ {metrics.diff} vs last month</span>
                    ) : (
                      <span className="text-gray-500 font-medium">= 0 vs last month</span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Active (last 30 days)</div>
              {overviewLoading ? (
                <div className="mt-2 h-8 bg-gray-200 rounded animate-pulse" />
              ) : (
                <div className="mt-1 text-2xl font-semibold text-gray-900">{metrics.activeCustomers}</div>
              )}
            </div>

            <Link
              to="/admin/users?status=flagged"
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
              onClick={() => setShowUsersModal(false)}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm text-gray-600">Flagged accounts</div>
                  {overviewLoading ? (
                    <div className="mt-2 h-8 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{metrics.flagged}</div>
                  )}
                </div>
                <StatusBadge tone={metrics.flagged > 0 ? 'amber' : 'gray'}>
                  {metrics.flagged > 0 ? 'Needs attention' : 'OK'}
                </StatusBadge>
              </div>
              <div className="text-xs text-gray-500 mt-2">View suspended/banned</div>
            </Link>
          </div>

          {/* 2. Alert cards row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              {
                key: 'sla24',
                count: metrics.enquiriesBreaching24h,
                label: 'Open enquiries past 24 hrs',
                border: metrics.enquiriesBreaching24h > 0 ? 'border-red-300' : 'border-gray-200',
                link: '/admin/users?signal=overdue-enquiries',
              },
              {
                key: 'after7',
                count: metrics.overdueAfterSaleCount,
                label: 'After-sale requests past 7 days',
                border: metrics.overdueAfterSaleCount > 0 ? 'border-amber-300' : 'border-gray-200',
                link: '/admin/users?signal=overdue-after-sale',
              },
              {
                key: 'unhappy',
                count: metrics.unhappyCustomersCount,
                label: 'Low satisfaction ratings (last 30 days)',
                border: metrics.unhappyCustomersCount > 0 ? 'border-red-300' : 'border-gray-200',
                link: '/admin/users?signal=unhappy-customers',
              },
              {
                key: 'reviews',
                count: metrics.pendingReviews,
                label: 'Reviews awaiting moderation',
                border: metrics.pendingReviews > 0 ? 'border-amber-300' : 'border-gray-200',
                link: '/admin/reviews',
              },
            ].map((a) => (
              <div key={a.key} className={`bg-white rounded-lg border ${a.border} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {overviewLoading ? <span className="inline-block w-10 h-6 bg-gray-200 rounded animate-pulse" /> : a.count}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{a.label}</div>
                  </div>
                  <Link
                    to={a.link}
                    onClick={() => setShowUsersModal(false)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View all
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Top customers table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-900">Top customers</h4>
              <p className="text-xs text-gray-500 mt-1">Top 5 by lifetime spend</p>
            </div>
            {overviewLoading ? (
              <div className="p-6 space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
            ) : metrics.topCustomers.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No customers yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white">
                    <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                      <th className="px-6 py-3">Rank</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3 text-right">Total orders</th>
                      <th className="px-6 py-3 text-right">Lifetime spend</th>
                      <th className="px-6 py-3">Last order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {metrics.topCustomers.map((u, idx) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">{idx + 1}</td>
                        <td className="px-6 py-3">
                          <Link
                            to={`/admin/users/${u._id}`}
                            onClick={() => setShowUsersModal(false)}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {u.name}
                          </Link>
                        </td>
                        <td className="px-6 py-3 text-gray-700">{u.email}</td>
                        <td className="px-6 py-3 text-right tabular-nums">{u.orderCount ?? 0}</td>
                        <td className="px-6 py-3 text-right tabular-nums font-medium">{formatINR(u.lifetimeSpend ?? 0)}</td>
                        <td className="px-6 py-3 text-gray-700 whitespace-nowrap">
                          {u.lastOrderDate ? formatDDMMMYYYY(u.lastOrderDate) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. Recent activity feed + 5. Customers with no orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900">Recent activity</h4>
              <p className="text-xs text-gray-500 mt-1">Last 10 events across customers</p>

              {overviewLoading ? (
                <div className="mt-4 space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
              ) : metrics.feed.length === 0 ? (
                <div className="mt-4 text-sm text-gray-500">No recent activity</div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {metrics.feed.map((ev, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${ev.color}`}>
                        {ev.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-gray-900">
                          <Link
                            to={`/admin/users/${ev.userId}`}
                            onClick={() => setShowUsersModal(false)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {users.find((u) => String(u._id) === String(ev.userId))?.name || 'Customer'}
                          </Link>{' '}
                          <span className="text-gray-700">{ev.text.replace(/^.*?\\s/, '')}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{formatFeedTime(ev.at)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setNeverOrderedOpen((v) => !v)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-medium text-gray-900">
                    Registered but never ordered ({metrics.neverOrdered.length})
                  </span>
                  <span className="text-gray-500">{neverOrderedOpen ? '−' : '+'}</span>
                </button>
                {neverOrderedOpen && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                          <th className="py-2 pr-4">Name</th>
                          <th className="py-2 pr-4">Email</th>
                          <th className="py-2 pr-4">Joined</th>
                          <th className="py-2 pr-4 text-right">Days since</th>
                          <th className="py-2"> </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {metrics.neverOrdered.slice(0, 20).map((u) => (
                          <tr key={u._id}>
                            <td className="py-2 pr-4 font-medium text-gray-900">{u.name}</td>
                            <td className="py-2 pr-4 text-gray-700">{u.email}</td>
                            <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">{formatDDMMMYYYY(u.createdAt)}</td>
                            <td className="py-2 pr-4 text-right tabular-nums">{u.daysSince}</td>
                            <td className="py-2">
                              <Link
                                to={`/admin/users/${u._id}`}
                                onClick={() => setShowUsersModal(false)}
                                className="text-blue-600 hover:underline"
                              >
                                View profile
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900">Quick actions</h4>
              <p className="text-xs text-gray-500 mt-1">Jump to key admin pages</p>
              <div className="mt-4 space-y-2">
                <Link to="/admin/users" onClick={() => setShowUsersModal(false)} className="block text-blue-600 hover:underline text-sm">
                  Open full user list
                </Link>
                <Link to="/admin/reviews" onClick={() => setShowUsersModal(false)} className="block text-blue-600 hover:underline text-sm">
                  Moderate reviews
                </Link>
                <Link to="/admin/after-sale" onClick={() => setShowUsersModal(false)} className="block text-blue-600 hover:underline text-sm">
                  After-sale requests
                </Link>
                <Link to="/admin/service-enquiries" onClick={() => setShowUsersModal(false)} className="block text-blue-600 hover:underline text-sm">
                  Service enquiries
                </Link>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer List ({filteredUsers.length} users)
              </h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user._id.slice(-8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const acc = accountStatusDisplay(user.status);
                            return <StatusBadge tone={acc.tone}>{acc.label}</StatusBadge>;
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewUserProfile(user)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user._id, user.status)}
                              className={`font-medium ${
                                user.status === 'active'
                                  ? 'text-red-600 hover:text-red-900'
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {user.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No customers have registered yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {showUserProfile && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-heading text-dark-brown">User Profile</h2>
                  <p className="text-gray-600 font-paragraph">Detailed information and order history</p>
                </div>
                <button
                  onClick={() => setShowUserProfile(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-heading text-dark-brown mb-4">Basic Information</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xl font-medium text-blue-600">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-heading text-dark-brown">{selectedUser.name}</h4>
                        <p className="text-gray-600">{selectedUser.email}</p>
                        {(() => {
                          const acc = accountStatusDisplay(selectedUser.status);
                          return (
                            <span className="mt-1 inline-block">
                              <StatusBadge tone={acc.tone}>{acc.label}</StatusBadge>
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Phone:</span>
                        <span className="text-gray-600">{selectedUser.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Address:</span>
                        <span className="text-gray-600">{selectedUser.address || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Account Created:</span>
                        <span className="text-gray-600">{formatDate(selectedUser.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Last Login:</span>
                        <span className="text-gray-600">
                          {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => toggleUserStatus(selectedUser._id, selectedUser.status)}
                        className={`w-full py-2 px-4 rounded-lg font-paragraph transition-colors duration-200 ${
                          selectedUser.status === 'active'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {selectedUser.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Order History */}
                <div>
                  <h3 className="text-lg font-heading text-dark-brown mb-4">Order History</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    {userOrders.length > 0 ? (
                      <div className="space-y-4">
                        {userOrders.map((order, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">Order #{order._id.slice(-8)}</h4>
                              <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Items:</span>
                                <span className="font-medium">{order.items.length}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-medium">{formatINR(order.total)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Status:</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">No Orders Yet</h4>
                        <p className="text-sm text-gray-500">This customer hasn't made any purchases.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Current Cart */}
                <div>
                  <h3 className="text-lg font-heading text-dark-brown mb-4">Current Cart</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    {userCart && userCart.items && userCart.items.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-medium text-gray-700">
                            {userCart.items.length} item(s) in cart
                          </span>
                          <span className="text-lg font-semibold text-gray-900">
                            Total: ₹{userCart.total.toLocaleString()}
                          </span>
                        </div>
                        {userCart.items.map((item, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-600">{item.category} - {item.subcategory}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                <p className="text-sm font-medium text-gray-700">
                                  Subtotal: ₹{(item.price * item.quantity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Empty Cart</h4>
                        <p className="text-sm text-gray-500">This customer's cart is currently empty.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Wishlist */}
                <div>
                  <h3 className="text-lg font-heading text-dark-brown mb-4">Wishlist</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    {userWishlist && userWishlist.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-medium text-gray-700">
                            {userWishlist.length} item(s) in wishlist
                          </span>
                        </div>
                        {userWishlist.map((item, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-600">{item.category} - {item.subcategory}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
                                <p className="text-sm text-gray-600">Added to wishlist</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Empty Wishlist</h4>
                        <p className="text-sm text-gray-500">This customer hasn't added any items to their wishlist.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

