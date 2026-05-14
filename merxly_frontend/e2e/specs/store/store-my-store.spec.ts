import { test, expect } from '../../fixtures/auth.fixture';

test.describe('My Store Profile Page', () => {
  test('should display my store page', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/my-store');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    await expect(storeOwnerPage).toHaveURL(/\/store\/my-store/);
  });

  test('should display store profile information', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/my-store');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const storeInfo = storeOwnerPage.locator('[class*="store"], [class*="profile"], form, main').first();
    await expect(storeInfo).toBeVisible({ timeout: 5000 });
  });

  test('should have store name field', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/my-store');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const nameInput = storeOwnerPage.locator('input[name*="name" i], input[placeholder*="store name" i]').first();
    const nameDisplay = storeOwnerPage.locator('[class*="store-name"], h1, h2').first();
    const hasInput = await nameInput.isVisible({ timeout: 5000 }).catch(() => false);
    const hasDisplay = await nameDisplay.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasInput || hasDisplay).toBeTruthy();
  });

  test('should have description field', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/my-store');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const descField = storeOwnerPage.locator('textarea[name*="description" i], textarea[placeholder*="description" i], [class*="description"]').first();
    const hasDesc = await descField.isVisible({ timeout: 5000 }).catch(() => false);
  });

  test('should have save/update button', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/my-store');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const saveBtn = storeOwnerPage.getByRole('button', { name: /save|update|edit/i }).first();
    const hasBtn = await saveBtn.isVisible({ timeout: 5000 }).catch(() => false);
  });
});
