import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Store Owner Onboarding Flow', () => {
  test('should display store sign-up page for customer', async ({ customerPage }) => {
    await customerPage.goto('/sign-up-new-store');
    await customerPage.waitForLoadState('networkidle');
    await expect(customerPage).toHaveURL(/\/sign-up-new-store/);
  });

  test('should display store application form', async ({ customerPage }) => {
    await customerPage.goto('/sign-up-new-store');
    await customerPage.waitForLoadState('networkidle');
    const form = customerPage.locator('form, [class*="form"], [class*="application"]').first();
    await expect(form).toBeVisible({ timeout: 5000 });
  });

  test('should have required form fields for store application', async ({ customerPage }) => {
    await customerPage.goto('/sign-up-new-store');
    await customerPage.waitForLoadState('networkidle');
    const nameInput = customerPage.locator('input[name*="name" i], input[placeholder*="store name" i]').first();
    const hasName = await nameInput.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasName).toBeTruthy();
  });

  test('should have submit application button', async ({ customerPage }) => {
    await customerPage.goto('/sign-up-new-store');
    await customerPage.waitForLoadState('networkidle');
    const submitBtn = customerPage.getByRole('button', { name: /submit|apply|register|create/i }).first();
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
  });
});
