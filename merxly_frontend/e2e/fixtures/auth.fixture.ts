import { test as base, type Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, '..', '.auth');

type AuthFixtures = {
  customerPage: Page;
  adminPage: Page;
  storeOwnerPage: Page;
};

export const test = base.extend<AuthFixtures>({
  customerPage: async ({ browser }, use) => {
    const statePath = path.join(AUTH_DIR, 'customer.json');
    if (!fs.existsSync(statePath)) {
      throw new Error('Customer auth state not found. Run global-setup first.');
    }
    const context = await browser.newContext({ storageState: statePath });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  adminPage: async ({ browser }, use) => {
    const statePath = path.join(AUTH_DIR, 'admin.json');
    if (!fs.existsSync(statePath)) {
      throw new Error('Admin auth state not found. Run global-setup first.');
    }
    const context = await browser.newContext({ storageState: statePath });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  storeOwnerPage: async ({ browser }, use) => {
    const statePath = path.join(AUTH_DIR, 'store-owner.json');
    if (!fs.existsSync(statePath)) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await use(page);
      await context.close();
      return;
    }
    const context = await browser.newContext({ storageState: statePath });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
