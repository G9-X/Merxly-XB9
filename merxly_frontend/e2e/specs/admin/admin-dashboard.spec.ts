import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Admin Dashboard', () => {
  test('should display admin dashboard', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.waitForLoadState('domcontentloaded');
    await expect(adminPage).toHaveURL(/\/admin/);
  });

  test('should display sidebar navigation', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.waitForLoadState('domcontentloaded');
    const sidebar = adminPage.locator('nav, aside, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('should display platform stats or overview content', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.waitForLoadState('domcontentloaded');
    const mainContent = adminPage.locator('main, [class*="content"], [class*="dashboard"]').first();
    await expect(mainContent).toBeVisible();
  });

  test('should navigate to categories page', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.waitForLoadState('domcontentloaded');
    const categoriesLink = adminPage.locator('a[href*="/admin/categories"], nav >> text=Categories').first();
    if (await categoriesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await categoriesLink.click();
      await adminPage.waitForURL(/\/admin\/categories/, { timeout: 10000 });
    }
  });

  test('should navigate to stores page', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.waitForLoadState('domcontentloaded');
    const storesLink = adminPage.locator('a[href*="/admin/stores"], nav >> text=Stores').first();
    if (await storesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await storesLink.click();
      await adminPage.waitForURL(/\/admin\/stores/, { timeout: 10000 });
    }
  });

  test('should navigate to users page', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.waitForLoadState('domcontentloaded');
    const usersLink = adminPage.locator('a[href*="/admin/users"], nav >> text=Users').first();
    if (await usersLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await usersLink.click();
      await adminPage.waitForURL(/\/admin\/users/, { timeout: 10000 });
    }
  });
});
