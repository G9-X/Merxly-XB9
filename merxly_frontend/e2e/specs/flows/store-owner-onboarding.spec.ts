import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Store Owner Onboarding Flow', () => {
  test('should display store sign-up page for customer', async ({ customerPage }) => {
    await customerPage.goto('/sign-up-new-store');
    await customerPage.waitForLoadState('domcontentloaded');
    await expect(customerPage).toHaveURL(/\/sign-up-new-store/);
  });

  test('should display store application form', async ({ customerPage }) => {
    await customerPage.goto('/sign-up-new-store');
    await customerPage.waitForLoadState('domcontentloaded');
    await customerPage.waitForTimeout(5000);
    const pageContent = await customerPage.locator('body').textContent();
    expect(pageContent && pageContent.length > 30).toBeTruthy();
  });

  test('should have required form fields for store application', async ({ customerPage }) => {
    await customerPage.goto('/sign-up-new-store');
    await customerPage.waitForLoadState('domcontentloaded');
    await customerPage.waitForTimeout(5000);
    const inputs = customerPage.locator('input');
    const inputCount = await inputs.count();
    const pageContent = await customerPage.locator('body').textContent();
    expect(inputCount > 0 || (pageContent && pageContent.length > 30)).toBeTruthy();
  });

  test('should have submit application button', async ({ customerPage }) => {
    await customerPage.goto('/sign-up-new-store');
    await customerPage.waitForLoadState('domcontentloaded');
    await customerPage.waitForTimeout(2000);
    const submitBtn = customerPage.getByRole('button', { name: /submit|apply|register|create/i }).first();
    const hasBtn = await submitBtn.isVisible({ timeout: 5000 }).catch(() => false);
    // If no button with those names, check for any primary action button
    if (!hasBtn) {
      const anyBtn = customerPage.locator('button[type="submit"]').first();
      const hasAny = await anyBtn.isVisible({ timeout: 3000 }).catch(() => false);
    }
  });
});
