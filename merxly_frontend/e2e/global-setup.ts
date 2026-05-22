import { test as setup } from '@playwright/test';
import { loginViaApi, registerViaApi, buildStorageState } from './helpers/auth.helper';
import { TEST_ACCOUNTS } from './helpers/test-data';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, '.auth');
const BASE_URL = process.env.BASE_URL || 'http://localhost:80';

setup('authenticate all roles', async () => {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  // Admin - uses seeded account
  try {
    const adminAuth = await loginViaApi(
      TEST_ACCOUNTS.admin.email,
      TEST_ACCOUNTS.admin.password
    );
    const adminState = buildStorageState(adminAuth, BASE_URL);
    fs.writeFileSync(
      path.join(AUTH_DIR, 'admin.json'),
      JSON.stringify(adminState, null, 2)
    );
    console.log('Admin auth state saved');
  } catch (e) {
    console.warn('Admin login failed:', (e as Error).message);
  }

  // Customer - register or login
  try {
    let customerAuth;
    try {
      customerAuth = await loginViaApi(
        TEST_ACCOUNTS.customer.email,
        TEST_ACCOUNTS.customer.password
      );
    } catch {
      customerAuth = await registerViaApi(
        TEST_ACCOUNTS.customer.firstName,
        TEST_ACCOUNTS.customer.lastName,
        TEST_ACCOUNTS.customer.email,
        TEST_ACCOUNTS.customer.password
      );
    }
    const customerState = buildStorageState(customerAuth, BASE_URL);
    fs.writeFileSync(
      path.join(AUTH_DIR, 'customer.json'),
      JSON.stringify(customerState, null, 2)
    );
    console.log('Customer auth state saved');
  } catch (e) {
    console.warn('Customer auth failed:', (e as Error).message);
  }

  // StoreOwner - only if credentials provided
  if (TEST_ACCOUNTS.storeOwner.email && TEST_ACCOUNTS.storeOwner.password) {
    try {
      const storeAuth = await loginViaApi(
        TEST_ACCOUNTS.storeOwner.email,
        TEST_ACCOUNTS.storeOwner.password
      );
      const storeState = buildStorageState(storeAuth, BASE_URL);
      fs.writeFileSync(
        path.join(AUTH_DIR, 'store-owner.json'),
        JSON.stringify(storeState, null, 2)
      );
      console.log('StoreOwner auth state saved');
    } catch (e) {
      console.warn('StoreOwner login failed:', (e as Error).message);
    }
  } else {
    console.warn('StoreOwner credentials not provided, skipping store auth setup');
  }
});
