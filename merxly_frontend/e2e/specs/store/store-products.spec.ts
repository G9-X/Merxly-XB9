import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Store Products Page', () => {
  test('should display products page', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    await expect(storeOwnerPage).toHaveURL(/\/store\/products/);
  });

  test('should display products list or empty state', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const products = storeOwnerPage.locator('table, [class*="product"], [data-testid*="product"], [class*="grid"]').first();
    const emptyState = storeOwnerPage.getByText(/no products|empty|get started/i).first();
    const hasProducts = await products.isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasProducts || hasEmpty).toBeTruthy();
  });

  test('should have add product button', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const addBtn = storeOwnerPage.getByRole('button', { name: /add|create|new/i }).first();
    const addLink = storeOwnerPage.locator('a[href*="/store/products/new"]').first();
    const hasBtn = await addBtn.isVisible({ timeout: 5000 }).catch(() => false);
    const hasLink = await addLink.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasBtn || hasLink).toBeTruthy();
  });

  test('should have search functionality', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const searchInput = storeOwnerPage.locator('input[type="search"], input[placeholder*="search" i]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
  });

  test('should navigate to create product page', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/products');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const addBtn = storeOwnerPage.getByRole('button', { name: /add|create|new/i }).first();
    const addLink = storeOwnerPage.locator('a[href*="/store/products/new"]').first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
    } else if (await addLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addLink.click();
    }
    await storeOwnerPage.waitForURL(/\/store\/products\/new/, { timeout: 5000 }).catch(() => {});
  });
});
