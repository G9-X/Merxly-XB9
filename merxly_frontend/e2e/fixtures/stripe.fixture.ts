import { type Page } from '@playwright/test';
import { STRIPE_TEST_CARDS } from '../helpers/test-data';

export async function fillStripeCardElement(
  page: Page,
  cardNumber: string = STRIPE_TEST_CARDS.visa
): Promise<void> {
  const stripeFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();

  await stripeFrame.locator('[name="cardnumber"]').fill(cardNumber);
  await stripeFrame.locator('[name="exp-date"]').fill(STRIPE_TEST_CARDS.expDate);
  await stripeFrame.locator('[name="cvc"]').fill(STRIPE_TEST_CARDS.cvc);

  const zipField = stripeFrame.locator('[name="postal"]');
  if (await zipField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await zipField.fill(STRIPE_TEST_CARDS.zip);
  }
}
