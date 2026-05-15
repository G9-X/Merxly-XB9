import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../page-objects/auth/register.page';

test.describe('Register Page', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('should display registration form', async () => {
    await expect(registerPage.firstNameInput).toBeVisible();
    await expect(registerPage.lastNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
  });

  test('should show validation errors for empty required fields', async () => {
    await registerPage.submitButton.click();
    const errors = registerPage.page.locator('.text-destructive, .text-red-600');
    await expect(errors.first()).toBeVisible();
  });

  test('should show error when passwords do not match', async () => {
    await registerPage.firstNameInput.fill('Test');
    await registerPage.lastNameInput.fill('User');
    await registerPage.emailInput.fill('mismatch@test.com');
    await registerPage.passwordInput.fill('Test@12345');
    await registerPage.confirmPasswordInput.fill('Different@123');
    await registerPage.submitButton.click();
    const errorText = registerPage.page.locator('.text-destructive, .text-red-600');
    await expect(errorText.first()).toBeVisible();
  });

  test('should show error for weak password', async () => {
    await registerPage.firstNameInput.fill('Test');
    await registerPage.lastNameInput.fill('User');
    await registerPage.emailInput.fill('weak@test.com');
    await registerPage.passwordInput.fill('weak');
    await registerPage.confirmPasswordInput.fill('weak');
    await registerPage.submitButton.click();
    const errorText = registerPage.page.locator('.text-destructive, .text-red-600');
    await expect(errorText.first()).toBeVisible();
  });

  test('should register successfully and redirect', async () => {
    const uniqueEmail = `e2e-reg-${Date.now()}@merxly.test`;
    await registerPage.register('Test', 'NewUser', uniqueEmail, 'Test@12345');
    // Should redirect to home after successful registration
    await registerPage.page.waitForURL((url) => {
      const path = url.pathname;
      return path === '/' || path === '' || path.includes('/login');
    }, { timeout: 15000 });
  });

  test('should show error for duplicate email', async () => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@merxly.com';
    await registerPage.register('Duplicate', 'User', adminEmail, 'Test@12345');
    await expect(
      registerPage.page.locator('.text-red-600, [class*="error"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to login page via link', async () => {
    await registerPage.loginLink.click();
    await expect(registerPage.page).toHaveURL(/\/login/);
  });
});
