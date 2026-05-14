export const API_BASE_URL = 'http://localhost:7052/api';

export const TEST_ACCOUNTS = {
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@merxly.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
  },
  customer: {
    email: 'e2e-customer@merxly.test',
    password: 'Test@12345',
    firstName: 'Test',
    lastName: 'Customer',
  },
  storeOwner: {
    email: process.env.STORE_OWNER_EMAIL || '',
    password: process.env.STORE_OWNER_PASSWORD || '',
  },
};

export const STRIPE_TEST_CARDS = {
  visa: '4242424242424242',
  declined: '4000000000000002',
  requires3ds: '4000002500003155',
  expDate: '12/30',
  cvc: '123',
  zip: '10001',
};

export const AUTH_STORAGE_KEY = 'auth';

export const TIMEOUTS = {
  navigation: 10000,
  apiResponse: 15000,
  animation: 1000,
};
