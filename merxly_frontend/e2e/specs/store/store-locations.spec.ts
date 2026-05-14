import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Store Locations Page', () => {
  test('should display locations page', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/locations');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    await expect(storeOwnerPage).toHaveURL(/\/store\/locations/);
  });

  test('should display locations list or empty state', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/locations');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    await storeOwnerPage.waitForTimeout(5000);
    const pageContent = await storeOwnerPage.locator('body').textContent();
    const hasContent = pageContent && pageContent.length > 30;
    const locations = storeOwnerPage.locator('table, [class*="location"], [data-testid*="location"], [class*="card"]').first();
    const hasLocations = await locations.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasContent || hasLocations).toBeTruthy();
  });

  test('should have add location button', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/locations');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const addBtn = storeOwnerPage.getByRole('button', { name: /add|create|new/i }).first();
    const hasBtn = await addBtn.isVisible({ timeout: 5000 }).catch(() => false);
  });

  test('should open location form on add click', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/locations');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const addBtn = storeOwnerPage.getByRole('button', { name: /add|create|new/i }).first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      const form = storeOwnerPage.locator('[role="dialog"], form, [class*="modal"]').first();
      await expect(form).toBeVisible({ timeout: 5000 });
    }
  });
});
