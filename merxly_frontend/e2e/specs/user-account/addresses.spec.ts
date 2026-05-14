import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Addresses Page', () => {
  test('should display addresses page', async ({ customerPage }) => {
    await customerPage.goto('/user-account/addresses');
    await customerPage.waitForLoadState('networkidle');
    await expect(customerPage).toHaveURL(/\/user-account\/addresses/);
  });

  test('should display address list or empty state', async ({ customerPage }) => {
    await customerPage.goto('/user-account/addresses');
    await customerPage.waitForLoadState('networkidle');
    const emptyMessage = customerPage.getByText(/no address|empty|add your first/i).first();
    const addressCards = customerPage.locator('[class*="address"], [data-testid*="address"]').first();
    const hasEmpty = await emptyMessage.isVisible({ timeout: 5000 }).catch(() => false);
    const hasAddresses = await addressCards.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasEmpty || hasAddresses).toBeTruthy();
  });

  test('should have add new address button', async ({ customerPage }) => {
    await customerPage.goto('/user-account/addresses');
    await customerPage.waitForLoadState('networkidle');
    const addBtn = customerPage.getByRole('button', { name: /add|new|create/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
  });

  test('should open address form modal on add click', async ({ customerPage }) => {
    await customerPage.goto('/user-account/addresses');
    await customerPage.waitForLoadState('networkidle');
    const addBtn = customerPage.getByRole('button', { name: /add|new|create/i }).first();
    await addBtn.click();
    const modal = customerPage.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('should display address form fields in modal', async ({ customerPage }) => {
    await customerPage.goto('/user-account/addresses');
    await customerPage.waitForLoadState('networkidle');
    const addBtn = customerPage.getByRole('button', { name: /add|new|create/i }).first();
    await addBtn.click();
    await customerPage.waitForTimeout(500);

    const formInputs = customerPage.locator('[role="dialog"] input, [class*="modal"] input');
    const count = await formInputs.count();
    expect(count).toBeGreaterThan(0);
  });
});
