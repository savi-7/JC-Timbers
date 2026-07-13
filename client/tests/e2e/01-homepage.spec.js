import { test, expect } from '@playwright/test';

test.describe('Authentication (Login and Registration)', () => {
  test('validates login and registration screens', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();

    await page.getByRole('link', { name: /register here/i }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
  });
});
