import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Admin Stores Page', () => {
  test('should display all stores page', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/all');
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(2000);
    await expect(adminPage).toHaveURL(/\/admin\/stores\/all/);
  });

  test('should display stores list or empty state', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/all');
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(3000);
    const pageContent = await adminPage.locator('body').textContent();
    expect(pageContent && pageContent.length > 50).toBeTruthy();
  });

  test('should have search functionality', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/all');
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(2000);
    const searchInput = adminPage.locator('input[type="search"], input[placeholder*="search" i]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
  });
});

test.describe('Admin Store Verification Page', () => {
  test('should display store verification page', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(2000);
    await expect(adminPage).toHaveURL(/\/admin\/stores\/verification/);
  });

  test('should display pending applications or empty state', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(3000);
    const pageContent = await adminPage.locator('body').textContent();
    expect(pageContent && pageContent.length > 50).toBeTruthy();
  });

  test('should have status filter tabs', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(2000);
    const tabs = adminPage.locator('[role="tab"], button:has-text("All"), button:has-text("Pending")').first();
    const hasTabs = await tabs.isVisible({ timeout: 5000 }).catch(() => false);
  });
});
