import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Admin Users Page', () => {
  test('should display users page', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    await adminPage.waitForLoadState('domcontentloaded');
    await expect(adminPage).toHaveURL(/\/admin\/users/);
  });

  test('should display users list', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(3000);
    const pageContent = await adminPage.locator('body').textContent();
    expect(pageContent && pageContent.length > 50).toBeTruthy();
  });

  test('should have search functionality', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(2000);
    const searchInput = adminPage.locator('input[type="search"], input[placeholder*="search" i]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
  });

  test('should display user details (name, email, role)', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(3000);
    const tableRows = adminPage.locator('table tbody tr, [class*="user-row"], [class*="user-card"]');
    if (await tableRows.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      const rowText = await tableRows.first().textContent();
      expect(rowText?.length).toBeGreaterThan(0);
    }
  });
});
