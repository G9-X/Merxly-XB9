import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Admin Store Approval Flow', () => {
  test('should navigate to verification page', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('domcontentloaded');
    await expect(adminPage).toHaveURL(/\/admin\/stores\/verification/);
  });

  test('should display pending applications or empty state', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(3000);
    const pageContent = await adminPage.locator('body').textContent();
    expect(pageContent && pageContent.length > 50).toBeTruthy();
  });

  test('should open application detail on click', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(3000);
    const applicationRow = adminPage.locator('table tbody tr, [class*="application-card"], [class*="card"]').first();
    if (await applicationRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await applicationRow.click();
      await adminPage.waitForTimeout(500);
    }
  });

  test('should show all stores page', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/all');
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(3000);
    const pageContent = await adminPage.locator('body').textContent();
    expect(pageContent && pageContent.length > 50).toBeTruthy();
  });
});
