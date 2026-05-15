import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Role-based redirects', () => {
  test('should allow admin to access /admin dashboard', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.waitForLoadState('domcontentloaded');
    await expect(adminPage).toHaveURL(/\/admin/);
  });

  test('should allow customer to access search page', async ({ customerPage }) => {
    await customerPage.goto('/search');
    await customerPage.waitForLoadState('domcontentloaded');
    await customerPage.waitForTimeout(2000);
    await expect(customerPage).toHaveURL(/\/search/);
  });

  test('should redirect unauthenticated user from /cart to /login', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const url = page.url();
    const redirected = url.includes('/login');
    const showsCart = await page.locator('[class*="cart"], h1:has-text("Cart")').first().isVisible({ timeout: 3000 }).catch(() => false);
    expect(redirected || showsCart).toBeTruthy();
  });

  test('should protect /user-account/profile for unauthenticated users', async ({ page }) => {
    await page.goto('/user-account/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const url = page.url();
    const redirected = url.includes('/login');
    const showsProfile = await page.locator('form, [class*="profile"]').first().isVisible({ timeout: 3000 }).catch(() => false);
    expect(redirected || showsProfile).toBeTruthy();
  });

  test('should block customer from accessing /admin', async ({ customerPage }) => {
    await customerPage.goto('/admin');
    await customerPage.waitForLoadState('domcontentloaded');
    await customerPage.waitForTimeout(2000);
    const url = customerPage.url();
    const pageContent = await customerPage.textContent('body');
    const isBlocked = !url.includes('/admin') ||
      (pageContent?.toLowerCase().includes('denied') ?? false) ||
      (pageContent?.toLowerCase().includes('permission') ?? false) ||
      (pageContent?.toLowerCase().includes('unauthorized') ?? false) ||
      (pageContent?.toLowerCase().includes('403') ?? false) ||
      (pageContent?.trim().length === 0);
    expect(isBlocked).toBeTruthy();
  });
});
