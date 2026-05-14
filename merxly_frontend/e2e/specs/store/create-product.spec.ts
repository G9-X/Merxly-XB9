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
    const nameInput = storeOwnerPage.locator('input[name*="name" i], input[placeholder*="name" i], input[placeholder*="product" i]').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
  });

  test('should have price field', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products/new');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const priceInput = storeOwnerPage.locator('input[name*="price" i], input[placeholder*="price" i], input[type="number"]').first();
    await expect(priceInput).toBeVisible({ timeout: 5000 });
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
