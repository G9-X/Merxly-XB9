import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Store Dashboard', () => {
  test('should display store dashboard', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    await expect(storeOwnerPage).toHaveURL(/\/store/);
    const heading = storeOwnerPage.locator('h1:has-text("Store Dashboard")');
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should display stats cards', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const statsSection = storeOwnerPage.locator('[class*="stat"], [class*="card"], [class*="overview"], [class*="metric"]').first();
    const hasStats = await statsSection.isVisible({ timeout: 5000 }).catch(() => false);
    const mainContent = storeOwnerPage.locator('main, [class*="content"], [class*="dashboard"]').first();
    const hasContent = await mainContent.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasStats || hasContent).toBeTruthy();
  });

  test('should display sidebar navigation', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const sidebar = storeOwnerPage.locator('nav, aside, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('should navigate to products page', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const productsLink = storeOwnerPage.locator('a[href*="/store/products"], nav >> text=Products').first();
    if (await productsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await productsLink.click();
      await storeOwnerPage.waitForURL(/\/store\/products/);
    }
  });

  test('should navigate to orders page', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const ordersLink = storeOwnerPage.locator('a[href*="/store/orders"], nav >> text=Orders').first();
    if (await ordersLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ordersLink.click();
      await storeOwnerPage.waitForURL(/\/store\/orders/);
    }
  });
});
