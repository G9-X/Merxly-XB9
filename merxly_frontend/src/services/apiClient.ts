import axios from 'axios';
import type { Response } from '../types/api/common';

const normalizeBaseUrl = (url: string): string => {
  // Keep protocol slashes (https://) but collapse accidental duplicate slashes in path.
  return url.replace(/([^:]\/)\/+?/g, '$1').replace(/\/+$/, '');
};

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://localhost:7052/api';
const API_BASE_URL = normalizeBaseUrl(RAW_API_BASE_URL);
console.log('API_BASE_URL:', API_BASE_URL);

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
    if (error.response?.data) {
      const errorData = error.response.data as Response<unknown>;

      // Extract error message from backend response
      let errorMessage = errorData.message || 'An error occurred';

      // If there are specific errors, include them
      if (errorData.errors && errorData.errors.length > 0) {
        errorMessage = errorData.errors.join(', ');
      }

      // Create a new error with the backend message
      const customError = new Error(errorMessage);
      return Promise.reject(customError);
    }

    // Fallback for network errors or other issues
    return Promise.reject(new Error(error.message || 'Network error occurred'));
  }
);

export default apiClient;
