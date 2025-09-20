'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@restosaas/ui';
import { User, LogOut } from 'lucide-react';
import { api } from '@/lib/api';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await api.get('/users/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    window.location.href = '/';
  };
  return (
    <nav className='border-b bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex-shrink-0'>
            <Link href='/' className='text-2xl font-bold text-gray-900'>
              RestoSaaS
            </Link>
          </div>
          <div className='hidden md:block'>
            <div className='ml-10 flex items-baseline space-x-4'>
              <Link
                href='/restaurants'
                className='text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'
              >
                Restaurants
              </Link>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            {isLoading ? (
              <div className='w-8 h-8 bg-gray-200 rounded-full animate-pulse'></div>
            ) : user ? (
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-700'>
                  {user.displayName || user.email}
                </span>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={handleLogout}
                  className='flex items-center gap-x-1'
                >
                  <LogOut className='w-4 h-4' />
                  Logout
                </Button>
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <Link href='/login'>
                  <Button size='sm' variant='outline'>
                    <User className='w-4 h-4 mr-1' />
                    Login
                  </Button>
                </Link>
                <Link href='/signup'>
                  <Button size='sm'>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
