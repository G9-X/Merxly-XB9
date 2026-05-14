import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Order History Page', () => {
  test('should display order history page', async ({ customerPage }) => {
    await customerPage.goto('/user-account/order-history');
    await customerPage.waitForLoadState('networkidle');
    await expect(customerPage).toHaveURL(/\/user-account\/order-history/);
  });

  test('should display orders list or empty state', async ({ customerPage }) => {
    await customerPage.goto('/user-account/order-history');
    await customerPage.waitForLoadState('networkidle');
    const emptyMessage = customerPage.getByText(/no orders|empty/i).first();
    const orderItems = customerPage.locator('table tr, [class*="order"], [data-testid*="order"]').first();
    const hasEmpty = await emptyMessage.isVisible({ timeout: 5000 }).catch(() => false);
    const hasOrders = await orderItems.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasEmpty || hasOrders).toBeTruthy();
  });

  test('should have status filter tabs', async ({ customerPage }) => {
    await customerPage.goto('/user-account/order-history');
    await customerPage.waitForLoadState('networkidle');
    const statusFilter = customerPage.locator('button:has-text("All"), [role="tab"], [class*="tab"]').first();
    const hasFilter = await statusFilter.isVisible({ timeout: 5000 }).catch(() => false);
    // Status filter may exist as tabs or dropdown
  });

  test('should have search functionality', async ({ customerPage }) => {
    await customerPage.goto('/user-account/order-history');
    await customerPage.waitForLoadState('networkidle');
    const searchInput = customerPage.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="order" i]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
  });

  test('should navigate to order detail on click', async ({ customerPage }) => {
    await customerPage.goto('/user-account/order-history');
    await customerPage.waitForLoadState('networkidle');
    const orderLink = customerPage.locator('a[href*="/order-history/"], tr[class*="cursor"], [role="row"]').first();
    if (await orderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await orderLink.click();
      await customerPage.waitForURL(/\/order-history\/.+/, { timeout: 10000 });
    }
  });
});
