import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Admin Categories Page', () => {
  test('should display categories page', async ({ adminPage }) => {
    await adminPage.goto('/admin/categories');
    await adminPage.waitForLoadState('domcontentloaded');
    await expect(adminPage).toHaveURL(/\/admin\/categories/);
  });

  test('should display categories list or empty state', async ({ adminPage }) => {
    await adminPage.goto('/admin/categories');
    await adminPage.waitForLoadState('domcontentloaded');
    const categories = adminPage.locator('table, [class*="category"], [data-testid*="category"], [class*="grid"]').first();
    const emptyState = adminPage.getByText(/no categories|empty/i).first();
    const hasCats = await categories.isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasCats || hasEmpty).toBeTruthy();
  });

  test('should have add category button', async ({ adminPage }) => {
    await adminPage.goto('/admin/categories');
    await adminPage.waitForLoadState('domcontentloaded');
    const addBtn = adminPage.getByRole('button', { name: /add|create|new/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
  });

  test('should open category form on add click', async ({ adminPage }) => {
    await adminPage.goto('/admin/categories');
    await adminPage.waitForLoadState('domcontentloaded');
    const addBtn = adminPage.getByRole('button', { name: /add|create|new/i }).first();
    await addBtn.click();
    const modal = adminPage.locator('[role="dialog"], [class*="modal"], form').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('should display category form fields', async ({ adminPage }) => {
    await adminPage.goto('/admin/categories');
    await adminPage.waitForLoadState('domcontentloaded');
    const addBtn = adminPage.getByRole('button', { name: /add|create|new/i }).first();
    await addBtn.click();
    await adminPage.waitForTimeout(500);
    const nameInput = adminPage.locator('input[name*="name" i], input[placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
  });
});
