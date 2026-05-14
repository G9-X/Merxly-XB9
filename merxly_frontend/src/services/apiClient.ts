import axios from 'axios';
import type { Response } from '../types/api/common';

const normalizeBaseUrl = (url: string): string => {
  // Keep protocol slashes (https://) but collapse accidental duplicate slashes in path.
  return url.replace(/([^:]\/)\/+?/g, '$1').replace(/\/+$/, '');
};

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://localhost:7052/api';
const API_BASE_URL = normalizeBaseUrl(RAW_API_BASE_URL);

let onUnauthorized: (() => void) | null = null;
export const registerUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
      localStorage.removeItem('auth');
      delete apiClient.defaults.headers.common['Authorization'];
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    if (error.response?.data) {
      const errorData = error.response.data as Response<unknown>;

      let errorMessage = errorData.message || 'An error occurred';

      if (errorData.errors && errorData.errors.length > 0) {
        errorMessage = errorData.errors.join(', ');
      }

      const customError = new Error(errorMessage);
      return Promise.reject(customError);
    }

    return Promise.reject(new Error(error.message || 'Network error occurred'));
  }
);

export default apiClient;
