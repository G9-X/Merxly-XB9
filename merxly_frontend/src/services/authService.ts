import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../types/api/auth';
import type { Response } from '../types/api/common';
import apiClient from './apiClient';

export const loginUser = async (
  data: LoginRequest,
): Promise<Response<LoginResponse>> => {
  const response = await apiClient.post<Response<LoginResponse>>(
    '/auth/login',
    data,
  );
  return response.data;
};

export const registerUser = async (
  data: RegisterRequest,
): Promise<Response<LoginResponse>> => {
  const response = await apiClient.post<Response<LoginResponse>>(
    '/auth/register',
    data,
  );
  return response.data;
};

export const refreshToken = async (): Promise<Response<LoginResponse>> => {
  const response = await apiClient.post<Response<LoginResponse>>(
    '/auth/refresh-token',
  );
  return response.data;
};

export const revokeToken = async (): Promise<Response<null>> => {
  const response = await apiClient.post<Response<null>>('/auth/revoke-token');
  return response.data;
};
