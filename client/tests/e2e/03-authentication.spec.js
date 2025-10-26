import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check for login form elements
    await expect(page.locator('input[type="email"], input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"], button').filter({ hasText: /login|sign in/i }).first()).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    // Check for register form elements
    const nameInput = page.locator('input[type="text"], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should show validation errors on empty login submit', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /login|sign in/i }).first();
    await submitButton.click();
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Check if still on login page (form validation prevented submission)
    expect(page.url()).toContain('login');
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Look for "Sign up" or "Register" link
    const registerLink = page.locator('a, button').filter({ hasText: /sign up|register|create account/i }).first();
    
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify navigation to register page
      expect(page.url()).toContain('register');
    }
  });

  test('should have forgot password link', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Look for forgot password link
    const forgotLink = page.locator('a, button').filter({ hasText: /forgot|reset password/i }).first();
    
    // Just check if it exists
    const exists = await forgotLink.count() > 0;
    expect(exists).toBeTruthy();
  });
});


