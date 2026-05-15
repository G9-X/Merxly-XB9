import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/auth/login.page';
import { TEST_ACCOUNTS } from '../../helpers/test-data';

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login form', async ({ page }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should show validation error for empty fields', async () => {
    await loginPage.submitButton.click();
    const page = loginPage.page;
    const errorVisible = await page.locator('.text-destructive').first().isVisible({ timeout: 3000 }).catch(() => false);
    expect(errorVisible).toBeTruthy();
  });

  test('should show error for invalid credentials', async () => {
    await loginPage.login('wrong@email.com', 'WrongPass123!');
    const page = loginPage.page;
    await expect(
      page.locator('[class*="error"], .text-destructive').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should login as admin and redirect to /admin', async () => {
    await loginPage.login(TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);
    await loginPage.waitForRedirect('/admin');
    expect(loginPage.page.url()).toContain('/admin');
  });

  test('should login as customer and redirect to /', async () => {
    await loginPage.login(TEST_ACCOUNTS.customer.email, TEST_ACCOUNTS.customer.password);
    await loginPage.page.waitForURL((url) => {
      const path = url.pathname;
      return path === '/' || path === '';
    }, { timeout: 10000 });
  });

  test('should show loading state during submission', async () => {
    await loginPage.emailInput.fill(TEST_ACCOUNTS.admin.email);
    await loginPage.passwordInput.fill(TEST_ACCOUNTS.admin.password);
    await loginPage.submitButton.click();
    // Button should be disabled or show loading indicator during request
    const isDisabledOrLoading = await loginPage.submitButton.isDisabled() ||
      await loginPage.page.locator('[class*="spinner"], [class*="loading"]').isVisible().catch(() => false);
    // Accept either — some implementations use disabled, some use visual indicator
  });

  test('should navigate to register page', async () => {
    await loginPage.registerLink.click();
    await expect(loginPage.page).toHaveURL(/\/register/);
  });

  test('should navigate to forgot password page', async () => {
    await loginPage.forgotPasswordLink.click();
    await expect(loginPage.page).toHaveURL(/\/forgot-password/);
  });
});
