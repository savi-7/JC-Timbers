import axios from 'axios';

const testAdminLogin = async () => {
  try {
    console.log('🔐 Testing admin login...');
    
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'jctimber@gmail.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('📊 Response data:', response.data);
    
    if (response.data.token) {
      console.log('🔑 Token received:', response.data.token.substring(0, 20) + '...');
      
      // Test the admin users endpoint with the token
      const usersResponse = await axios.get('http://localhost:5001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('✅ Admin users endpoint working!');
      console.log('👥 Users count:', usersResponse.data.users?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
};

testAdminLogin();
