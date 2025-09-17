'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/contexts/auth-context';

export function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, isLoading, login, logout } = useAuth();

  const handleLoginSuccess = async (userData: any) => {
    setIsLoginOpen(false);
    // The auth context will handle updating the user state
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className='border-b bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex-shrink-0'>
            <Link href='/' className='text-2xl font-bold text-gray-900'>
              RestoSaaS
            </Link>
          </div>

          {/* Navigation Links */}
          <div className='hidden md:block'>
            <div className='ml-10 flex items-baseline space-x-4'>
              <Link
                href='/restaurants'
                className='text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'
              >
                Restaurants
              </Link>
              {user && (
                <>
                  {/* Only OWNER and SUPER_ADMIN can see Owner Dashboard */}
                  {(user.role === 'OWNER' || user.role === 'SUPER_ADMIN') && (
                    <Link
                      href='/owner-dashboard'
                      className='text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'
                    >
                      Owner Dashboard
                    </Link>
                  )}
                  {/* Only SUPER_ADMIN can see Organization Dashboard */}
                  {user.role === 'SUPER_ADMIN' && (
                    <Link
                      href='/organization-dashboard'
                      className='text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'
                    >
                      Organization
                    </Link>
                  )}
                  {/* Only SUPER_ADMIN can see Super Admin */}
                  {user.role === 'SUPER_ADMIN' && (
                    <Link
                      href='/super-admin-dashboard'
                      className='text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'
                    >
                      Super Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Auth Section */}
          <div className='flex items-center space-x-4'>
            {isLoading ? (
              <div className='w-20 h-8 bg-gray-200 animate-pulse rounded'></div>
            ) : user ? (
              <div className='flex items-center space-x-4'>
                <span className='text-sm text-gray-700'>
                  Welcome, {user.displayName || user.email || 'User'}!
                </span>
                <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                  {user.role}
                </span>
                <Button variant='outline' size='sm' onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant='outline' size='sm'>
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle>Welcome to RestoSaaS</DialogTitle>
                  </DialogHeader>
                  <LoginForm onSuccess={handleLoginSuccess} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <Button variant='outline' size='sm'>
              Menu
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
