import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays hero section with title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(/AI-Powered/i);
  });

  test("displays navigation links", async ({ page }) => {
    await expect(page.getByRole("link", { name: /login/i })).toBeVisible();
  });

  test("displays feature sections", async ({ page }) => {
    await expect(page.locator("text=AI Valuation")).toBeVisible();
  });

  test("displays pricing section", async ({ page }) => {
    await expect(page.locator("text=Pick Your Speed")).toBeVisible();
    await expect(page.locator("text=$99")).toBeVisible();
  });

  test("displays CTA button", async ({ page }) => {
    const ctaButton = page.getByRole("link", { name: /get started/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test("is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1")).toBeVisible();
  });
});
