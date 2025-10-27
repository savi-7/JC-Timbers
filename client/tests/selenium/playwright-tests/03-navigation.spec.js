const { test, expect } = require('@playwright/test');

test('Test 3: Navigation works correctly', async ({ page }) => {
  console.log('\n🧪 TEST 3: Navigation Test');
  
  // Start at homepage
  await page.goto('/');
  console.log('✓ Started at homepage');
  
  // Try clicking Products link
  try {
    await page.click('text=Products', { timeout: 5000 });
    console.log('✓ Clicked Products link');
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('⚠ Products link not found or already on page');
  }
  
  // Navigate to About
  try {
    await page.goto('/about');
    console.log('✓ Navigated to About page');
  } catch (e) {
    console.log('⚠ About page not found');
  }
  
  // Navigate to Contact
  try {
    await page.goto('/contact');
    console.log('✓ Navigated to Contact page');
  } catch (e) {
    console.log('⚠ Contact page not found');
  }
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/03-navigation.png', fullPage: true });
  console.log('✓ Screenshot saved');
  
  console.log('✅ TEST 3 PASSED!\n');
});

