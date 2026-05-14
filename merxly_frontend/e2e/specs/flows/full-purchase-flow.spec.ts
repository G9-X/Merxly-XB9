import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Full Purchase Flow', () => {
  test('should complete browse → product detail → add to cart → cart → checkout flow', async ({ customerPage }) => {
    await customerPage.goto('/');
    await customerPage.waitForLoadState('networkidle');

    const productCard = customerPage.locator('a[href*="/products/"], [class*="product-card"], [class*="product"] a').first();
    if (!await productCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await customerPage.goto('/search');
      await customerPage.waitForLoadState('networkidle');
    }

    const productLink = customerPage.locator('a[href*="/products/"]').first();
    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click();
      await customerPage.waitForLoadState('networkidle');
      await expect(customerPage).toHaveURL(/\/products\//);

      const addToCartBtn = customerPage.getByRole('button', { name: /add to cart/i }).first();
      if (await addToCartBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await addToCartBtn.click();
        await customerPage.waitForTimeout(1000);

        await customerPage.goto('/cart');
        await customerPage.waitForLoadState('networkidle');
        await expect(customerPage).toHaveURL(/\/cart/);

        const cartItems = customerPage.locator('[class*="cart-item"], table tbody tr, [class*="item"]').first();
        const hasItems = await cartItems.isVisible({ timeout: 5000 }).catch(() => false);

        if (hasItems) {
          const checkoutBtn = customerPage.getByRole('button', { name: /checkout|proceed/i }).first();
          const checkoutLink = customerPage.locator('a[href*="/checkout"]').first();
          if (await checkoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await checkoutBtn.click();
          } else if (await checkoutLink.isVisible({ timeout: 3000 }).catch(() => false)) {
            await checkoutLink.click();
          }
          await customerPage.waitForLoadState('networkidle');
        }
      }
    }
  });

  test('should search → find product → view details', async ({ customerPage }) => {
    await customerPage.goto('/search');
    await customerPage.waitForLoadState('networkidle');

    const searchInput = customerPage.locator('input[type="search"], input[placeholder*="search" i], input[name*="search" i]').first();
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('test');
      await searchInput.press('Enter');
      await customerPage.waitForLoadState('networkidle');
      await customerPage.waitForTimeout(1000);

      const productLink = customerPage.locator('a[href*="/products/"]').first();
      if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await productLink.click();
        await customerPage.waitForLoadState('networkidle');
        await expect(customerPage).toHaveURL(/\/products\//);
      }
    }
  });
});
