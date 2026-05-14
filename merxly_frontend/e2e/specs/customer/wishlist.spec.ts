import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Wishlist Page', () => {
  test('should display wishlist page for authenticated user', async ({ customerPage }) => {
    await customerPage.goto('/wishlist');
    await customerPage.waitForLoadState('networkidle');
    await expect(customerPage).toHaveURL(/\/wishlist/);
  });

  test('should display empty wishlist or wishlist items', async ({ customerPage }) => {
    await customerPage.goto('/wishlist');
    await customerPage.waitForLoadState('networkidle');
    const emptyMessage = customerPage.getByText(/empty|no items|no wishlist/i).first();
    const wishlistItems = customerPage.locator('[class*="wishlist"], [class*="product"], [data-testid*="wishlist"]').first();
    const hasEmpty = await emptyMessage.isVisible({ timeout: 5000 }).catch(() => false);
    const hasItems = await wishlistItems.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasEmpty || hasItems).toBeTruthy();
  });

  test('should navigate to product from wishlist item', async ({ customerPage }) => {
    await customerPage.goto('/wishlist');
    await customerPage.waitForLoadState('networkidle');
    const productLink = customerPage.locator('a[href*="/products/"]').first();
    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click();
      await customerPage.waitForURL(/\/products\/.+/);
      expect(customerPage.url()).toMatch(/\/products\/.+/);
    }
  });
});
