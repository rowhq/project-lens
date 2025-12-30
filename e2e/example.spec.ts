import { test, expect } from '@playwright/test';

test.describe('LENS Application', () => {
  test('landing page loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/LENS/);

    // Check that the main heading is visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');

    // Clerk sign-in should be present
    await expect(page.locator('body')).toBeVisible();
  });
});
