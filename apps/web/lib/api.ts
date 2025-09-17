import axios from 'axios';
import { API_ENDPOINTS, HTTP_STATUS, STORAGE_KEYS } from './constants';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api',
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  // Check if we're in the browser before accessing localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle client-side errors
    if (
      typeof window !== 'undefined' &&
      error.response?.status === HTTP_STATUS.UNAUTHORIZED
    ) {
      // Don't redirect on login/register endpoints - let the component handle the error
      const isAuthEndpoint =
        error.config?.url?.includes(API_ENDPOINTS.LOGIN) ||
        error.config?.url?.includes(API_ENDPOINTS.REGISTER) ||
        error.config?.url?.includes('/auth/oauth/');

      if (!isAuthEndpoint) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);
