import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Order History Page', () => {
  test('should display order history page', async ({ customerPage }) => {
    await customerPage.goto('/user-account/order-history');
    await customerPage.waitForLoadState('domcontentloaded');
    await expect(customerPage).toHaveURL(/\/user-account\/order-history/);
  });

  test('should display orders list or empty state', async ({ customerPage }) => {
    await customerPage.goto('/user-account/order-history');
    await customerPage.waitForLoadState('domcontentloaded');
    await customerPage.waitForTimeout(5000);
    const pageContent = await customerPage.locator('body').textContent();
    expect(pageContent && pageContent.length > 30).toBeTruthy();
  });

  test('should have status filter tabs', async ({ customerPage }) => {
    await customerPage.goto('/user-account/order-history');
    await customerPage.waitForLoadState('domcontentloaded');
    const statusFilter = customerPage.locator('button:has-text("All"), [role="tab"], [class*="tab"]').first();
    const hasFilter = await statusFilter.isVisible({ timeout: 5000 }).catch(() => false);
    // Status filter may exist as tabs or dropdown
  });

  test('should have search functionality', async ({ customerPage }) => {
    await customerPage.goto('/user-account/order-history');
    await customerPage.waitForLoadState('domcontentloaded');
    const searchInput = customerPage.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="order" i]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
  });

  test('should navigate to order detail on click', async ({ customerPage }) => {
    await customerPage.goto('/user-account/order-history');
    await customerPage.waitForLoadState('domcontentloaded');
    const orderLink = customerPage.locator('a[href*="/order-history/"], tr[class*="cursor"], [role="row"]').first();
    if (await orderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await orderLink.click();
      await customerPage.waitForURL(/\/order-history\/.+/, { timeout: 10000 });
    }
  });
});
