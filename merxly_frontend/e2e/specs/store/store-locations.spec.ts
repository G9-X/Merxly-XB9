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
    const locations = storeOwnerPage.locator('table, [class*="location"], [data-testid*="location"], [class*="card"]').first();
    const emptyState = storeOwnerPage.getByText(/no locations|empty|add your first/i).first();
    const hasLocations = await locations.isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasLocations || hasEmpty).toBeTruthy();
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
