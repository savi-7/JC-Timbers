import React, { useState } from 'react';
import { useDashboardData, useDetailedData, useModalState } from '../hooks/useDashboardData';
import { useBlockBackNavigation, usePreventRefresh } from '../hooks/useBlockNavigation';
import { calculateCustomerStats, createSafeStats } from '../utils/dashboardUtils';
import { LoadingState, ErrorState } from '../components/admin/LoadingStates';
import { useToast } from '../components/admin/ToastNotification';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';
import StatsCards from '../components/admin/StatsCards';
import QuickActions from '../components/admin/QuickActions';
import SystemStatus from '../components/admin/SystemStatus';
import UsersModal from '../components/admin/modals/UsersModal';
import ProductsModal from '../components/admin/modals/ProductsModal';
import OrdersModal from '../components/admin/modals/OrdersModal';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Toast notification system
  const { showToast, ToastContainer } = useToast();
  
  // Block browser back navigation and page refresh
  useBlockBackNavigation(showToast);
  usePreventRefresh();
  
  // Custom hooks for data management
  const { dashboardData, loading, error } = useDashboardData();
  const { detailedData, detailedLoading, fetchDetailedData } = useDetailedData();
  const {
    showUsersModal,
    setShowUsersModal,
    showProductsModal,
    setShowProductsModal,
    showOrdersModal,
    setShowOrdersModal,
    handleCardClick
  } = useModalState();

  // Show loading state
  if (loading || detailedLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error && !dashboardData) {
    return <ErrorState error={error} />;
  }

  // Calculate stats
  const customerStats = calculateCustomerStats(detailedData, dashboardData);
  const safeStats = createSafeStats(dashboardData, customerStats);
  
  // Debug logging
  console.log('Dashboard Debug:', {
    dashboardData,
    detailedData,
    customerStats,
    safeStats
  });

  // Handle card clicks with data fetching
  const onCardClick = (type) => {
    handleCardClick(type, fetchDetailedData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <StatsCards safeStats={safeStats} handleCardClick={onCardClick} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <QuickActions />
            </div>
            <div className="lg:col-span-1">
              <SystemStatus safeStats={safeStats} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UsersModal 
        showUsersModal={showUsersModal}
        setShowUsersModal={setShowUsersModal}
        detailedData={detailedData}
        safeStats={safeStats}
      />
      
      <ProductsModal 
        showProductsModal={showProductsModal}
        setShowProductsModal={setShowProductsModal}
        detailedData={detailedData}
        safeStats={safeStats}
      />
      
      <OrdersModal 
        showOrdersModal={showOrdersModal}
        setShowOrdersModal={setShowOrdersModal}
        detailedData={detailedData}
        safeStats={safeStats}
      />
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
