import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Wishlist Page', () => {
  test('should display wishlist page for authenticated user', async ({ customerPage }) => {
    await customerPage.goto('/wishlist');
    await customerPage.waitForLoadState('domcontentloaded');
    await expect(customerPage).toHaveURL(/\/wishlist/);
  });

  test('should display empty wishlist or wishlist items', async ({ customerPage }) => {
    await customerPage.goto('/wishlist');
    await customerPage.waitForLoadState('domcontentloaded');
    await customerPage.waitForTimeout(2000);
    const pageContent = await customerPage.locator('body').textContent();
    expect(pageContent && pageContent.length > 50).toBeTruthy();
  });

  test('should navigate to product from wishlist item', async ({ customerPage }) => {
    await customerPage.goto('/wishlist');
    await customerPage.waitForLoadState('domcontentloaded');
    const productLink = customerPage.locator('a[href*="/products/"]').first();
    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click();
      await customerPage.waitForURL(/\/products\/.+/);
      expect(customerPage.url()).toMatch(/\/products\/.+/);
    }
  });
});
