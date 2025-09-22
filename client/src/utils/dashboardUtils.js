// Helper functions for dashboard calculations

export const calculateCustomerStats = (detailedData, stats) => {
  // Use the real dashboard data if available, otherwise fall back to detailed data
  if (stats && typeof stats.totalUsers === 'number') {
    return {
      totalCustomers: stats.totalUsers,
      newCustomers: stats.newUsers || 0
    };
  }
  
  // Fallback to detailed data calculation if dashboard data is not available
  if (!detailedData || !detailedData.users || !Array.isArray(detailedData.users) || detailedData.users.length === 0) {
    return {
      totalCustomers: 0,
      newCustomers: 0
    };
  }
  
  const customers = detailedData.users.filter(user => user.role === 'customer');
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const newCustomersThisMonth = customers.filter(user => {
    const userDate = new Date(user.createdAt);
    return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
  }).length;
  
  return {
    totalCustomers: customers.length,
    newCustomers: newCustomersThisMonth
  };
};

export const createSafeStats = (dashboardData, customerStats) => {
  const stats = dashboardData || {};
  
  return {
    totalUsers: customerStats.totalCustomers, // Use calculated customer stats
    totalProducts: typeof stats?.totalProducts === 'number' ? stats.totalProducts : 0,
    totalOrders: typeof stats?.totalOrders === 'number' ? stats.totalOrders : 0,
    pendingOrders: typeof stats?.pendingOrders === 'number' ? stats.pendingOrders : 0,
    lowStockItems: typeof stats?.lowStockItems === 'number' ? stats.lowStockItems : 0,
    activeUsers: typeof stats?.activeUsers === 'number' ? stats.activeUsers : 0,
    newUsers: customerStats.newCustomers // Use calculated customer stats
  };
};

export const formatINR = (amount) => {
  if (typeof amount !== 'number') return '₹0';
  return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
};

