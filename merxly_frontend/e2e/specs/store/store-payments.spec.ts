import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Store Payments Page', () => {
  test('should display payments page', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/payments');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    await expect(storeOwnerPage).toHaveURL(/\/store\/payments/);
  });

  test('should display Stripe Connect status or setup prompt', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/payments');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const stripeStatus = storeOwnerPage.locator('[class*="stripe"], [class*="connect"], [class*="payment"]').first();
    const setupPrompt = storeOwnerPage.getByText(/connect|setup|stripe|payout/i).first();
    const hasStatus = await stripeStatus.isVisible({ timeout: 5000 }).catch(() => false);
    const hasSetup = await setupPrompt.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasStatus || hasSetup).toBeTruthy();
  });

  test('should display payout information or transactions', async ({ storeOwnerPage }) => {
    await storeOwnerPage.goto('/store/payments');
    await storeOwnerPage.waitForLoadState('domcontentloaded');
    const payoutSection = storeOwnerPage.locator('[class*="payout"], [class*="transaction"], table, [class*="balance"]').first();
    const emptyState = storeOwnerPage.getByText(/no (payouts|transactions)|empty/i).first();
    const hasPayouts = await payoutSection.isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasPayouts || hasEmpty).toBeTruthy();
  });
});
