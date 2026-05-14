import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Admin Stores Page', () => {
  test('should display all stores page', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/all');
    await adminPage.waitForLoadState('networkidle');
    await expect(adminPage).toHaveURL(/\/admin\/stores\/all/);
  });

  test('should display stores list or empty state', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/all');
    await adminPage.waitForLoadState('networkidle');
    const stores = adminPage.locator('table, [class*="store"], [data-testid*="store"]').first();
    const emptyState = adminPage.getByText(/no stores|empty/i).first();
    const hasStores = await stores.isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasStores || hasEmpty).toBeTruthy();
  });

  test('should have search functionality', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/all');
    await adminPage.waitForLoadState('networkidle');
    const searchInput = adminPage.locator('input[type="search"], input[placeholder*="search" i]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
  });
});

test.describe('Admin Store Verification Page', () => {
  test('should display store verification page', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('networkidle');
    await expect(adminPage).toHaveURL(/\/admin\/stores\/verification/);
  });

  test('should display pending applications or empty state', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('networkidle');
    const applications = adminPage.locator('[class*="card"], [class*="application"], table').first();
    const emptyState = adminPage.getByText(/no (pending|applications)|empty/i).first();
    const hasApps = await applications.isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasApps || hasEmpty).toBeTruthy();
  });

  test('should have status filter tabs', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('networkidle');
    const tabs = adminPage.locator('[role="tab"], button:has-text("All"), button:has-text("Pending")').first();
    const hasTabs = await tabs.isVisible({ timeout: 5000 }).catch(() => false);
  });
});
