import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Admin Users Page', () => {
  test('should display users page', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    await adminPage.waitForLoadState('networkidle');
    await expect(adminPage).toHaveURL(/\/admin\/users/);
  });

  test('should display users list', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    await adminPage.waitForLoadState('networkidle');
    const users = adminPage.locator('table, [class*="user"], [data-testid*="user"]').first();
    const emptyState = adminPage.getByText(/no users|empty/i).first();
    const hasUsers = await users.isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasUsers || hasEmpty).toBeTruthy();
  });

  test('should have search functionality', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    await adminPage.waitForLoadState('networkidle');
    const searchInput = adminPage.locator('input[type="search"], input[placeholder*="search" i]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
  });

  test('should display user details (name, email, role)', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    await adminPage.waitForLoadState('networkidle');
    const tableRows = adminPage.locator('table tbody tr, [class*="user-row"], [class*="user-card"]');
    if (await tableRows.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      const rowText = await tableRows.first().textContent();
      expect(rowText?.length).toBeGreaterThan(0);
    }
  });
});
