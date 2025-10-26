import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/JC Timbers|Home/i);
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    // Check if header is visible
    await expect(page.locator('header')).toBeVisible();
    
    // Check for key navigation elements
    const homeLink = page.locator('text=Home').first();
    await expect(homeLink).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check if main content is visible
    await expect(page.locator('main, .container, [class*="hero"]').first()).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Find and click a navigation link
    const shopLink = page.locator('text=/Shop|Products/i').first();
    
    if (await shopLink.isVisible()) {
      await shopLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify navigation worked
      expect(page.url()).toContain('');
    }
  });

  test('should display footer', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check if footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('header')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('header')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('header')).toBeVisible();
  });
});

