import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginRequest, CreateUserRequest } from '@restosaas/types';
import { api } from '../lib/api-client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: CreateUserRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,

      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true });
          const response = await api.login(credentials);

          // Store token in localStorage
          localStorage.setItem('authToken', response.data.token);

          set({ user: response.data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: CreateUserRequest) => {
        try {
          set({ isLoading: true });
          const response = await api.register(userData);

          // Store token in localStorage
          localStorage.setItem('authToken', response.data.token);

          set({ user: response.data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('authToken');
        set({ user: null, isLoading: false });
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const token = localStorage.getItem('authToken');

          if (!token) {
            set({ user: null, isLoading: false });
            return;
          }

          const response = await api.getMe();
          set({ user: response.data, isLoading: false });
        } catch (error) {
          localStorage.removeItem('authToken');
          set({ user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
