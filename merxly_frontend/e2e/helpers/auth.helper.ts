import { type Page, type BrowserContext } from '@playwright/test';
import { API_BASE_URL, AUTH_STORAGE_KEY } from './test-data';

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarPublicId: string | null;
  roles: string[];
}

interface ApiResponse<T> {
  data: T | null;
  isSuccess: boolean;
  message: string;
  statusCode: number;
  errors: string[] | null;
}

export async function loginViaApi(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const body: ApiResponse<LoginResponse> = await response.json();

  if (!body.isSuccess || !body.data) {
    throw new Error(`Login failed for ${email}: ${body.message}`);
  }

  return body.data;
}

export async function registerViaApi(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password, confirmPassword: password }),
  });

  const body = await response.json();

  if (body.isSuccess && body.data) {
    return body.data as LoginResponse;
  }

  if (body.errors && typeof body.errors === 'object' && !Array.isArray(body.errors)) {
    const validationErrors = Object.values(body.errors).flat().join('; ');
    throw new Error(`Register failed for ${email}: ${validationErrors}`);
  }

  throw new Error(`Register failed for ${email}: ${body.message || JSON.stringify(body)}`);
}

export async function injectAuthState(page: Page, loginResponse: LoginResponse): Promise<void> {
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key: AUTH_STORAGE_KEY, value: loginResponse }
  );
}

export async function clearAuthState(page: Page): Promise<void> {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, AUTH_STORAGE_KEY);
}

export function buildStorageState(loginResponse: LoginResponse, baseURL: string) {
  return {
    cookies: [],
    origins: [
      {
        origin: baseURL,
        localStorage: [
          {
            name: AUTH_STORAGE_KEY,
            value: JSON.stringify(loginResponse),
          },
        ],
      },
    ],
  };
}
