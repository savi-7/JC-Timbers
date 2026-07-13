import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test('opens cart page and validates cart UI state', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole('heading', { name: /your shopping cart/i })).toBeVisible();
    await expect(
      page.getByText(/your cart is empty|order summary|loading your cart/i).first()
    ).toBeVisible();
  });
});
