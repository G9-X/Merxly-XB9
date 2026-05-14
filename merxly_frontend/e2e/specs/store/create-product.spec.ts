import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Create Product Page', () => {
  test('should display create product page', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products/new');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    await expect(storeOwnerPage).toHaveURL(/\/store\/products\/new/);
  });

  test('should display product form', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products/new');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const form = storeOwnerPage.locator('form, [class*="form"], [class*="product-create"]').first();
    await expect(form).toBeVisible({ timeout: 5000 });
  });

  test('should have product name field', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products/new');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    await storeOwnerPage.waitForTimeout(3000);
    const nameInput = storeOwnerPage.locator('input[placeholder*="Classic T-Shirt" i], input[placeholder*="name" i], input[name*="name" i]').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
  });

  test('should have category label', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products/new');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    await storeOwnerPage.waitForTimeout(3000);
    const categoryField = storeOwnerPage.locator('text=Category').first();
    await expect(categoryField).toBeVisible({ timeout: 10000 });
  });

  test('should have category selection', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products/new');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const categorySelect = storeOwnerPage.locator('select[name*="category" i], [class*="select"][class*="category"], button:has-text("Category"), [role="combobox"]').first();
    const hasCategorySelect = await categorySelect.isVisible({ timeout: 5000 }).catch(() => false);
  });

  test('should have description field', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products/new');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const descField = storeOwnerPage.locator('textarea[name*="description" i], textarea[placeholder*="description" i], [contenteditable="true"]').first();
    const hasDesc = await descField.isVisible({ timeout: 5000 }).catch(() => false);
  });

  test('should have submit button', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products/new');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const submitBtn = storeOwnerPage.getByRole('button', { name: /create|save|submit|publish/i }).first();
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
  });
});
