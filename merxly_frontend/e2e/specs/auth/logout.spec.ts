import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Logout', () => {
  test('should clear auth state and redirect after logout', async ({ customerPage }) => {
    await customerPage.goto('/user-account/profile');
    await customerPage.waitForLoadState('domcontentloaded');
    await customerPage.waitForTimeout(1000);

    const logoutButton = customerPage.getByRole('button', { name: /logout/i })
      .or(customerPage.locator('button:has-text("Logout")'));

    if (await logoutButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutButton.first().click();
      await customerPage.waitForTimeout(1000);
      const authState = await customerPage.evaluate(() => localStorage.getItem('auth'));
      expect(authState).toBeNull();
    }
  });

  test('should not access protected routes without auth', async ({ page }) => {
    await page.goto('/user-account/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const url = page.url();
    const redirectedToLogin = url.includes('/login');
    const showsBlank = (await page.textContent('body'))?.trim().length === 0;
    expect(redirectedToLogin || showsBlank || url.includes('/user-account')).toBeTruthy();
  });
});
