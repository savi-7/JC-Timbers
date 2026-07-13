import { test, expect } from '@playwright/test';

test.describe('Wishlist Functionality', () => {
  test('opens wishlist route and validates auth or wishlist state', async ({ page }) => {
    await page.goto('/wishlist');
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/wishlist$|\/login$/);

    if (/\/wishlist$/.test(currentUrl)) {
      await expect(page.getByRole('heading', { name: /my wishlist/i })).toBeVisible();
    } else {
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    }
  });
});
