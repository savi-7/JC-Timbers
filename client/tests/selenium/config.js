export const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
export const API_BASE_URL = process.env.E2E_API_BASE || 'http://localhost:5001';

export function createTestUser() {
  const timestamp = Date.now();
  return {
    firstName: 'Test',
    lastName: 'User',
    email: `selenium.user.${timestamp}@example.com`,
    phone: '9876543210',
    password: 'Tester@1234'
  };
}


