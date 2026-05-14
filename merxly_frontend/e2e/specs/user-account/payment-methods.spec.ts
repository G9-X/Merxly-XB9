import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Payment Methods Page', () => {
  test('should display payment methods page', async ({ customerPage }) => {
    await customerPage.goto('/user-account/payment-methods');
    await customerPage.waitForLoadState('networkidle');
    await expect(customerPage).toHaveURL(/\/user-account\/payment-methods/);
  });

  test('should display payment methods list or empty state', async ({ customerPage }) => {
    await customerPage.goto('/user-account/payment-methods');
    await customerPage.waitForLoadState('networkidle');
    const emptyMessage = customerPage.getByText(/no payment|empty|add your first/i).first();
    const cards = customerPage.locator('[class*="payment"], [class*="card"], [data-testid*="payment"]').first();
    const hasEmpty = await emptyMessage.isVisible({ timeout: 5000 }).catch(() => false);
    const hasCards = await cards.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasEmpty || hasCards).toBeTruthy();
  });

  test('should have add new payment method button', async ({ customerPage }) => {
    await customerPage.goto('/user-account/payment-methods');
    await customerPage.waitForLoadState('networkidle');
    const addBtn = customerPage.getByRole('button', { name: /add|new|create/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
  });
});
