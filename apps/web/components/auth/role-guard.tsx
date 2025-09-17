'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/lib/constants';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/',
}: RoleGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
          router.push(redirectTo);
          return;
        }

        // Get user info from token or make API call
        const response = await api.get(API_ENDPOINTS.ME);
        const userData = response.data;

        if (!allowedRoles.includes(userData.role)) {
          router.push(redirectTo);
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
