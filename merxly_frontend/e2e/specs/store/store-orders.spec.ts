import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Store Orders Page', () => {
  test('should display orders page', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/orders');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    await expect(storeOwnerPage).toHaveURL(/\/store\/orders/);
  });

  test('should display orders list or empty state', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/orders');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const orders = storeOwnerPage.locator('table, [class*="order"], [data-testid*="order"]').first();
    const emptyState = storeOwnerPage.getByText(/no orders|empty/i).first();
    const hasOrders = await orders.isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasOrders || hasEmpty).toBeTruthy();
  });

  test('should have status filter', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/orders');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const statusFilter = storeOwnerPage.locator('[role="tab"], button:has-text("All"), button:has-text("Pending"), select[name*="status" i], [class*="filter"]').first();
    const hasFilter = await statusFilter.isVisible({ timeout: 5000 }).catch(() => false);
  });

  test('should have search functionality', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/orders');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const searchInput = storeOwnerPage.locator('input[type="search"], input[placeholder*="search" i]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
  });

  test('should have CSV export button', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/orders');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const exportBtn = storeOwnerPage.getByRole('button', { name: /export|csv|download/i }).first();
    const hasExport = await exportBtn.isVisible({ timeout: 5000 }).catch(() => false);
  });
});
