import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('can navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /login/i }).click();
    await expect(page).toHaveURL(/login/);
  });

  test('can navigate to register page', async ({ page }) => {
    await page.goto('/');
    const registerLink = page.getByRole('link', { name: /sign up|register|get started/i }).first();
    await registerLink.click();
    await expect(page).toHaveURL(/register|sign-up/);
  });

  test('unauthorized users are redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login or show sign-in
    await expect(page).toHaveURL(/login|sign-in/);
  });

  test('unauthorized users are redirected from appraisals', async ({ page }) => {
    await page.goto('/appraisals');
    await expect(page).toHaveURL(/login|sign-in/);
  });

  test('unauthorized users are redirected from admin', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/login|sign-in/);
  });
});
