import axios from 'axios';

const testAdminAccess = async () => {
  try {
    console.log('🔐 Testing admin login...');
    
    // Test login
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'jctimber@gmail.com',
      password: 'Jctimber@12'
    });
    
    console.log('✅ Login successful!');
    console.log('👤 User:', loginResponse.data.user.name);
    console.log('🔑 Role:', loginResponse.data.user.role);
    
    const token = loginResponse.data.token;
    
    // Test admin dashboard endpoint
    const dashboardResponse = await axios.get('http://localhost:5001/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Admin dashboard accessible!');
    console.log('📊 Dashboard data:', dashboardResponse.data);
    
    // Test admin users endpoint
    const usersResponse = await axios.get('http://localhost:5001/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Admin users endpoint accessible!');
    console.log('👥 Users count:', usersResponse.data.users?.length || 0);
    
    console.log('\n🎯 Frontend Instructions:');
    console.log('1. Go to your login page');
    console.log('2. Use these credentials:');
    console.log('   Email: jctimber@gmail.com');
    console.log('   Password: Jctimber@12');
    console.log('3. After login, you should be redirected to /admin/dashboard');
    console.log('4. If you see a 404 error, check browser console for details');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testAdminAccess();
