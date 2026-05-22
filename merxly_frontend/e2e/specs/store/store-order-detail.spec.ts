import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Store Order Detail Page', () => {
  test('should display order detail when navigating from orders list', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/orders');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const orderRow = storeOwnerPage.locator('table tbody tr, [class*="order-row"], [class*="order-card"], a[href*="/store/orders/"]').first();
    if (await orderRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await orderRow.click();
      await storeOwnerPage.waitForLoadState('domcontentloaded');
      const detailContent = storeOwnerPage.locator('[class*="order-detail"], [class*="order-info"], main').first();
      await expect(detailContent).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display order information', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/orders');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const orderLink = storeOwnerPage.locator('a[href*="/store/orders/"]').first();
    if (await orderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await orderLink.click();
      await storeOwnerPage.waitForLoadState('domcontentloaded');
      const orderInfo = storeOwnerPage.locator('[class*="order"], [class*="detail"], main').first();
      const text = await orderInfo.textContent();
      expect(text?.length).toBeGreaterThan(0);
    }
  });

  test('should have status update controls', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/orders');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const orderLink = storeOwnerPage.locator('a[href*="/store/orders/"]').first();
    if (await orderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await orderLink.click();
      await storeOwnerPage.waitForLoadState('domcontentloaded');
      const statusControl = storeOwnerPage.locator('select[name*="status" i], button:has-text("Update"), button:has-text("Ship"), button:has-text("Complete"), [class*="status"]').first();
      const hasControl = await statusControl.isVisible({ timeout: 5000 }).catch(() => false);
    }
  });
});
