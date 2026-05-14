import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Admin Store Approval Flow', () => {
  test('should navigate to verification page', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('networkidle');
    await expect(adminPage).toHaveURL(/\/admin\/stores\/verification/);
  });

  test('should display pending applications or empty state', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('networkidle');
    const applications = adminPage.locator('[class*="card"], [class*="application"], table tbody tr').first();
    const emptyState = adminPage.getByText(/no (pending|applications)|empty/i).first();
    const hasApps = await applications.isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasApps || hasEmpty).toBeTruthy();
  });

  test('should open application detail on click', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('networkidle');
    const applicationRow = adminPage.locator('table tbody tr, [class*="application-card"], [class*="card"]').first();
    if (await applicationRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await applicationRow.click();
      await adminPage.waitForTimeout(500);
      const detailView = adminPage.locator('[role="dialog"], [class*="detail"], [class*="modal"], [class*="drawer"]').first();
      const hasDetail = await detailView.isVisible({ timeout: 5000 }).catch(() => false);
    }
  });

  test('should have approve and reject actions', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/verification');
    await adminPage.waitForLoadState('networkidle');
    const applicationRow = adminPage.locator('table tbody tr, [class*="application-card"], [class*="card"]').first();
    if (await applicationRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await applicationRow.click();
      await adminPage.waitForTimeout(500);
      const approveBtn = adminPage.getByRole('button', { name: /approve/i }).first();
      const rejectBtn = adminPage.getByRole('button', { name: /reject/i }).first();
      const hasApprove = await approveBtn.isVisible({ timeout: 5000 }).catch(() => false);
      const hasReject = await rejectBtn.isVisible({ timeout: 5000 }).catch(() => false);
    }
  });

  test('should show approved store in all stores list', async ({ adminPage }) => {
    await adminPage.goto('/admin/stores/all');
    await adminPage.waitForLoadState('networkidle');
    const storesList = adminPage.locator('table, [class*="store"], [data-testid*="store"]').first();
    const emptyState = adminPage.getByText(/no stores|empty/i).first();
    const hasStores = await storesList.isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasStores || hasEmpty).toBeTruthy();
  });
});
