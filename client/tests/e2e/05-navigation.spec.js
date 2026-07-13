import { test, expect } from '@playwright/test';

test.describe('Marketplace Functionality', () => {
  test('opens marketplace and validates listing area state', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/\/marketplace$/);
    await expect(page.getByText(/no listings yet|no listings found|loading listings/i).first()).toBeVisible();
  });
});
