import { test, expect } from '@playwright/test';

test.describe('After-Sale Service Functionality', () => {
  test('opens after-sale request route and validates form or login state', async ({ page }) => {
    await page.goto('/after-sale/new');
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/after-sale\/new$|\/login$/);

    if (/\/after-sale\/new$/.test(currentUrl)) {
      await expect(page.getByRole('heading', { name: /after-sale service request/i })).toBeVisible();
      await expect(page.getByText(/step 1: product/i)).toBeVisible();
    } else {
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    }
  });
});
