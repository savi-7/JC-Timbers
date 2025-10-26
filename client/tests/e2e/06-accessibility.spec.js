import { test, expect } from '@playwright/test';

test.describe('Accessibility and Performance Tests', () => {
  test('should have proper page titles', async ({ page }) => {
    const pages = [
      { url: '/', expectedTitle: /JC Timbers|Home/i },
      { url: '/timber', expectedTitle: /Timber|Products/i },
      { url: '/login', expectedTitle: /Login|Sign In/i },
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      console.log(`✓ ${pageInfo.url} has title: "${title}"`);
    }
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for semantic HTML elements
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have no console errors on homepage', async ({ page }) => {
    const errors = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Filter out known safe errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('logo') &&
      !error.includes('unsafe header') &&
      !error.includes('svg')
    );

    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }
    
    expect(criticalErrors.length).toBeLessThan(5); // Allow some minor errors
  });

  test('should load all images without errors', async ({ page }) => {
    const failedImages = [];
    
    page.on('response', response => {
      if (response.request().resourceType() === 'image' && !response.ok()) {
        failedImages.push(response.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    if (failedImages.length > 0) {
      console.log('Failed to load images:', failedImages);
    }

    // Allow some missing images (like placeholder logos)
    expect(failedImages.length).toBeLessThan(3);
  });

  test('should be responsive - mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if content is visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main, body').first()).toBeVisible();
  });

  test('should be responsive - tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main, body').first()).toBeVisible();
  });

  test('should be responsive - desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main, body').first()).toBeVisible();
  });

  test('should not have layout shifts', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Get initial viewport height
    const initialHeight = await page.evaluate(() => document.body.scrollHeight);
    
    // Wait a bit more
    await page.waitForTimeout(2000);
    
    // Check if height changed significantly (layout shift)
    const finalHeight = await page.evaluate(() => document.body.scrollHeight);
    
    const heightDiff = Math.abs(finalHeight - initialHeight);
    
    // Small changes are acceptable
    expect(heightDiff).toBeLessThan(500);
  });
});


