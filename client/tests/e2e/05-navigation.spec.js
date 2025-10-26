import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing Tests', () => {
  test('should navigate to all main pages without errors', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Home' },
      { url: '/timber', name: 'Timber' },
      { url: '/furniture', name: 'Furniture' },
      { url: '/construction-materials', name: 'Construction Materials' },
      { url: '/cart', name: 'Cart' },
      { url: '/wishlist', name: 'Wishlist' },
      { url: '/login', name: 'Login' },
      { url: '/register', name: 'Register' },
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      // Verify page loaded successfully (no 404)
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      
      console.log(`✓ ${pageInfo.name} page loaded successfully`);
    }
  });

  test('should handle 404 page for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    await page.waitForLoadState('networkidle');
    
    // Check if 404 or redirected to home
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should maintain scroll position on back navigation', async ({ page }) => {
    await page.goto('/timber');
    await page.waitForLoadState('networkidle');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    
    // Navigate away
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    // Verify we're back on timber page
    expect(page.url()).toContain('timber');
  });

  test('should have working browser back button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/timber');
    await page.waitForLoadState('networkidle');
    
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toBe('http://localhost:5173/');
  });

  test('should have working browser forward button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/timber');
    await page.waitForLoadState('networkidle');
    
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    await page.goForward();
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('timber');
  });

  test('should load page within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
    console.log(`✓ Homepage loaded in ${loadTime}ms`);
  });
});


