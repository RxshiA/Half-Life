import axios, { AxiosError } from 'axios';
import { getToken, clearToken } from './auth-storage';

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

const api = axios.create({
  baseURL: import.meta.env['VITE_API_BASE_URL'] ?? 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: ApiError }>) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<{ error: ApiError }>).response?.data;
    if (data?.error) {
      return {
        message: data.error.message,
        code: data.error.code,
        details: data.error.details,
      };
    }
    return { message: error.message };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'An unexpected error occurred' };
}

export default api;
