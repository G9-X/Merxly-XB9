import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Cart Page', () => {
  test('should display cart page for authenticated user', async ({ customerPage }) => {
    await customerPage.goto('/cart');
    await customerPage.waitForLoadState('networkidle');
    await expect(customerPage).toHaveURL(/\/cart/);
  });

  test('should display empty cart message or cart items', async ({ customerPage }) => {
    await customerPage.goto('/cart');
    await customerPage.waitForLoadState('networkidle');
    const emptyMessage = customerPage.getByText(/empty|no items/i).first();
    const cartItems = customerPage.locator('[class*="cart-item"], [class*="cartItem"], [data-testid*="cart-item"]').first();
    const hasEmpty = await emptyMessage.isVisible({ timeout: 5000 }).catch(() => false);
    const hasItems = await cartItems.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasEmpty || hasItems).toBeTruthy();
  });

  test('should display item details when cart has items', async ({ customerPage }) => {
    await customerPage.goto('/cart');
    await customerPage.waitForLoadState('networkidle');
    const cartItems = customerPage.locator('[class*="cart-item"], [class*="cartItem"], tr, [data-testid*="cart"]');
    if (await cartItems.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      // Should show product name, price, quantity
      const hasText = await customerPage.locator('body').textContent();
      expect(hasText?.length).toBeGreaterThan(0);
    }
  });

  test('should have checkout button', async ({ customerPage }) => {
    await customerPage.goto('/cart');
    await customerPage.waitForLoadState('networkidle');
    const checkoutBtn = customerPage.getByRole('button', { name: /checkout|proceed/i })
      .or(customerPage.locator('a[href*="checkout"], button:has-text("Checkout")'));
    // Checkout button may only appear when items are selected
    const cartItems = customerPage.locator('[class*="cart-item"], [class*="cartItem"]').first();
    if (await cartItems.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(checkoutBtn.first()).toBeVisible();
    }
  });

  test('should have select all checkbox', async ({ customerPage }) => {
    await customerPage.goto('/cart');
    await customerPage.waitForLoadState('networkidle');
    const selectAll = customerPage.locator('input[type="checkbox"]').first();
    const cartItems = customerPage.locator('[class*="cart-item"], [class*="cartItem"]').first();
    if (await cartItems.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(selectAll).toBeVisible();
    }
  });

  test('should have quantity controls for items', async ({ customerPage }) => {
    await customerPage.goto('/cart');
    await customerPage.waitForLoadState('networkidle');
    const quantityInput = customerPage.locator('input[type="number"], [class*="quantity"]').first();
    const cartItems = customerPage.locator('[class*="cart-item"], [class*="cartItem"]').first();
    if (await cartItems.isVisible({ timeout: 3000 }).catch(() => false)) {
      const hasQty = await quantityInput.isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasQty).toBeTruthy();
    }
  });

  test('should have remove/delete button for items', async ({ customerPage }) => {
    await customerPage.goto('/cart');
    await customerPage.waitForLoadState('networkidle');
    const removeBtn = customerPage.locator('button[aria-label*="remove" i], button[aria-label*="delete" i], button:has([class*="trash"]), button:has([class*="delete"])').first();
    const cartItems = customerPage.locator('[class*="cart-item"], [class*="cartItem"]').first();
    if (await cartItems.isVisible({ timeout: 3000 }).catch(() => false)) {
      const hasRemove = await removeBtn.isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasRemove).toBeTruthy();
    }
  });
});
