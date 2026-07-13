// test-role-based-auth.js
// This script demonstrates how to test the role-based authentication system

import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

// Test data
const adminUser = {
  name: "JC Timber Admin",
  email: "adminjctimber@12",
  password: "jctimber123",
  role: "admin"
};

const customerUser = {
  name: "Customer User", 
  email: "customer@example.com",
  password: "customer123",
  role: "customer"
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url, token) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    return {
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};

// Test function
async function testRoleBasedAuth() {
  console.log('🧪 Testing Role-Based Authentication System\n');

  // 1. Register Admin User
  console.log('1. Registering Admin User...');
  try {
    await axios.post(`${API_BASE}/auth/register`, adminUser);
    console.log('✅ Admin user registered successfully');
  } catch (error) {
    console.log('ℹ️  Admin user might already exist:', error.response?.data?.message);
  }

  // 2. Register Customer User
  console.log('\n2. Registering Customer User...');
  try {
    await axios.post(`${API_BASE}/auth/register`, customerUser);
    console.log('✅ Customer user registered successfully');
  } catch (error) {
    console.log('ℹ️  Customer user might already exist:', error.response?.data?.message);
  }

  // 3. Login as Admin
  console.log('\n3. Logging in as Admin...');
  const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
    email: adminUser.email,
    password: adminUser.password
  });
  const adminToken = adminLogin.data.token;
  console.log('✅ Admin login successful');
  console.log('   User role:', adminLogin.data.user.role);

  // 4. Login as Customer
  console.log('\n4. Logging in as Customer...');
  const customerLogin = await axios.post(`${API_BASE}/auth/login`, {
    email: customerUser.email,
    password: customerUser.password
  });
  const customerToken = customerLogin.data.token;
  console.log('✅ Customer login successful');
  console.log('   User role:', customerLogin.data.user.role);

  // 5. Test Admin-only routes
  console.log('\n5. Testing Admin-only routes...');
  
  // Admin accessing admin dashboard (should work)
  const adminDashboard = await makeAuthenticatedRequest(`${API_BASE}/admin/dashboard`, adminToken);
  if (adminDashboard.error) {
    console.log('❌ Admin dashboard failed:', adminDashboard.error);
  } else {
    console.log('✅ Admin dashboard accessible to admin');
  }

  // Admin accessing admin overview (should work)
  const adminOverview = await makeAuthenticatedRequest(`${API_BASE}/admin/overview`, adminToken);
  if (adminOverview.error) {
    console.log('❌ Admin overview failed:', adminOverview.error);
  } else {
    console.log('✅ Admin overview accessible to admin');
    console.log('   Stock Count:', adminOverview.data.stockCount.total);
    console.log('   Pending Orders:', adminOverview.data.pendingOrders.total);
    console.log('   Recent Activities:', adminOverview.data.recentActivities.length);
  }

  // Customer trying to access admin dashboard (should fail)
  const customerTryingAdmin = await makeAuthenticatedRequest(`${API_BASE}/admin/dashboard`, customerToken);
  if (customerTryingAdmin.error) {
    console.log('✅ Admin dashboard correctly blocked for customer:', customerTryingAdmin.error);
  } else {
    console.log('❌ Admin dashboard should be blocked for customer');
  }

  // 6. Test Customer-only routes
  console.log('\n6. Testing Customer-only routes...');
  
  // Customer accessing customer profile (should work)
  const customerProfile = await makeAuthenticatedRequest(`${API_BASE}/customer/profile`, customerToken);
  if (customerProfile.error) {
    console.log('❌ Customer profile failed:', customerProfile.error);
  } else {
    console.log('✅ Customer profile accessible to customer');
  }

  // Admin trying to access customer profile (should fail)
  const adminTryingCustomer = await makeAuthenticatedRequest(`${API_BASE}/customer/profile`, adminToken);
  if (adminTryingCustomer.error) {
    console.log('✅ Customer profile correctly blocked for admin:', adminTryingCustomer.error);
  } else {
    console.log('❌ Customer profile should be blocked for admin');
  }

  // 7. Test shared routes
  console.log('\n7. Testing shared routes (admin OR customer)...');
  
  const adminSettings = await makeAuthenticatedRequest(`${API_BASE}/shared/settings`, adminToken);
  if (adminSettings.error) {
    console.log('❌ Shared settings failed for admin:', adminSettings.error);
  } else {
    console.log('✅ Shared settings accessible to admin');
  }

  const customerSettings = await makeAuthenticatedRequest(`${API_BASE}/shared/settings`, customerToken);
  if (customerSettings.error) {
    console.log('❌ Shared settings failed for customer:', customerSettings.error);
  } else {
    console.log('✅ Shared settings accessible to customer');
  }

  console.log('\n🎉 Role-based authentication testing completed!');
}

// Run the test
testRoleBasedAuth().catch(console.error);
