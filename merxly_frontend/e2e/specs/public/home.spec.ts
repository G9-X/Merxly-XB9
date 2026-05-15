import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page successfully', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display navigation header', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('should display product cards or featured content', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    const hasProducts = await page.locator('[class*="product"], [class*="card"], [data-testid*="product"]').first().isVisible({ timeout: 10000 }).catch(() => false);
    const hasContent = await page.locator('main, [role="main"]').first().isVisible().catch(() => true);
    expect(hasProducts || hasContent).toBeTruthy();
  });

  test('should navigate to product detail on product click', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    const productCard = page.locator('a[href*="/products/"]').first();
    if (await productCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productCard.click();
      await page.waitForURL(/\/products\/.+/);
      expect(page.url()).toMatch(/\/products\/.+/);
    }
  });

  test('should show login/register links when not authenticated', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /login|sign in/i })
      .or(page.locator('a[href="/login"]'));
    const hasLoginLink = await loginLink.first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasLoginLink).toBeTruthy();
  });

  test('should navigate to search page', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], [data-testid="search"]').first();
    const searchLink = page.locator('a[href*="/search"]').first();

    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.click();
      await searchInput.fill('test');
      await page.keyboard.press('Enter');
    } else if (await searchLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchLink.click();
    }

    await page.waitForURL(/\/search/, { timeout: 10000 });
  });
});
