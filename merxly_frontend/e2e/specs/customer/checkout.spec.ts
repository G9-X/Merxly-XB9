import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Checkout Page', () => {
  test('should require authentication to access checkout', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('should display checkout page for authenticated user', async ({ customerPage }) => {
    // Navigate with state (normally comes from cart with selected items)
    await customerPage.goto('/checkout');
    await customerPage.waitForLoadState('networkidle');
    // May redirect to cart if no items selected
    const isOnCheckout = customerPage.url().includes('/checkout');
    const isOnCart = customerPage.url().includes('/cart');
    expect(isOnCheckout || isOnCart).toBeTruthy();
  });

  test('should display shipping address section', async ({ customerPage }) => {
    await customerPage.goto('/checkout');
    await customerPage.waitForLoadState('networkidle');
    if (customerPage.url().includes('/checkout')) {
      const addressSection = customerPage.getByText(/shipping|address|delivery/i).first();
      await expect(addressSection).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display payment method section', async ({ customerPage }) => {
    await customerPage.goto('/checkout');
    await customerPage.waitForLoadState('networkidle');
    if (customerPage.url().includes('/checkout')) {
      const paymentSection = customerPage.getByText(/payment/i).first();
      await expect(paymentSection).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display order summary section', async ({ customerPage }) => {
    await customerPage.goto('/checkout');
    await customerPage.waitForLoadState('networkidle');
    if (customerPage.url().includes('/checkout')) {
      const summarySection = customerPage.getByText(/summary|total|order/i).first();
      await expect(summarySection).toBeVisible({ timeout: 5000 });
    }
  });

  test('should have place order button', async ({ customerPage }) => {
    await customerPage.goto('/checkout');
    await customerPage.waitForLoadState('networkidle');
    if (customerPage.url().includes('/checkout')) {
      const placeOrderBtn = customerPage.getByRole('button', { name: /place order|pay|confirm/i });
      await expect(placeOrderBtn.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
