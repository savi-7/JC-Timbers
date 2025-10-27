const { test, expect } = require('@playwright/test');

test('Test 1: Homepage loads successfully', async ({ page }) => {
  console.log('\n🧪 TEST 1: Homepage Test');
  
  // Navigate to homepage
  await page.goto('/');
  console.log('✓ Navigated to homepage');
  
  // Check page title
  await expect(page).toHaveTitle(/JC|Timber/i);
  console.log('✓ Page title verified');
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });
  console.log('✓ Screenshot saved');
  
  console.log('✅ TEST 1 PASSED!\n');
});

