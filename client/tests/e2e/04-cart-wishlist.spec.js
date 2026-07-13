import { test, expect } from '@playwright/test';

test.describe('Products Functionality', () => {
  test('navigates product category pages', async ({ page }) => {
    const categories = [
      { path: '/timber-products', heading: /premium timber products/i },
      { path: '/furniture', heading: /handcrafted furniture/i },
      { path: '/construction-materials', heading: /construction materials/i },
    ];

    for (const category of categories) {
      await page.goto(category.path);
      await page.waitForLoadState('domcontentloaded');

      await expect(page).toHaveURL(new RegExp(`${category.path}$`));
      await expect(page.getByRole('heading', { name: category.heading })).toBeVisible();
    }
  });
});
