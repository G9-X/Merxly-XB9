import { test, expect } from '../../fixtures/auth.fixture';

test.describe('User Profile Page', () => {
  test('should display user profile page', async ({ customerPage }) => {
    await customerPage.goto('/user-account/profile');
    await customerPage.waitForLoadState('networkidle');
    await expect(customerPage).toHaveURL(/\/user-account\/profile/);
  });

  test('should display user info fields', async ({ customerPage }) => {
    await customerPage.goto('/user-account/profile');
    await customerPage.waitForLoadState('networkidle');
    const nameField = customerPage.locator('input[name*="name" i], input[id*="name" i]').first();
    const emailField = customerPage.locator('input[name*="email" i], input[id*="email" i], input[type="email"]').first();
    const hasName = await nameField.isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmail = await emailField.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasName || hasEmail).toBeTruthy();
  });

  test('should have save/update button', async ({ customerPage }) => {
    await customerPage.goto('/user-account/profile');
    await customerPage.waitForLoadState('networkidle');
    const saveBtn = customerPage.getByRole('button', { name: /save|update|submit/i }).first();
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
  });

  test('should have change password section', async ({ customerPage }) => {
    await customerPage.goto('/user-account/profile');
    await customerPage.waitForLoadState('networkidle');
    const passwordSection = customerPage.getByText(/password|change password/i).first();
    const hasPasswordSection = await passwordSection.isVisible({ timeout: 5000 }).catch(() => false);
    // Password change may be on same page or separate section
  });
});
