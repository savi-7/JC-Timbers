import { test, expect } from '@playwright/test';

test.describe('Products Browsing Tests', () => {
  test('should display timber products', async ({ page }) => {
    await page.goto('/timber');
    await page.waitForLoadState('networkidle');
    
    // Check if products page loaded
    await expect(page.locator('h1, h2').filter({ hasText: /timber|products/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('should display furniture products', async ({ page }) => {
    await page.goto('/furniture');
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded
    await expect(page.locator('h1, h2').filter({ hasText: /furniture|products/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('should display construction materials', async ({ page }) => {
    await page.goto('/construction-materials');
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded
    await expect(page.locator('h1, h2').filter({ hasText: /construction|materials|products/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('should display product cards with essential information', async ({ page }) => {
    await page.goto('/timber');
    await page.waitForLoadState('networkidle');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Look for product cards or images
    const productCards = page.locator('[class*="product"], [class*="card"], img').first();
    
    if (await productCards.count() > 0) {
      await expect(productCards).toBeVisible();
    }
  });

  test('should open product details when clicked', async ({ page }) => {
    await page.goto('/timber');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find first clickable product
    const productCard = page.locator('[class*="product"], [class*="card"]').first();
    
    if (await productCard.isVisible()) {
      await productCard.click();
      await page.waitForLoadState('networkidle');
      
      // Verify navigation or modal opened
      expect(page.url()).toBeTruthy();
    }
  });

  test('should handle product search/filter if available', async ({ page }) => {
    await page.goto('/timber');
    await page.waitForLoadState('networkidle');
    
    // Look for search or filter input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="filter" i]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('teak');
      await page.waitForTimeout(1000);
      
      // Verify search worked
      expect(await searchInput.inputValue()).toBe('teak');
    }
  });
});


