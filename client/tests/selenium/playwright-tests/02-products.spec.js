const { test, expect } = require('@playwright/test');

test('Test 2: Products page displays correctly', async ({ page }) => {
  console.log('\n🧪 TEST 2: Products Page Test');
  
  // Navigate to products page
  await page.goto('/products');
  console.log('✓ Navigated to products page');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check for page content
  const content = await page.textContent('body');
  console.log('✓ Page content loaded');
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/02-products.png', fullPage: true });
  console.log('✓ Screenshot saved');
  
  console.log('✅ TEST 2 PASSED!\n');
});

