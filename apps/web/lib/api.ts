import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api',
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  // Check if we're in the browser before accessing localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
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
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
