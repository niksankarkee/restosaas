import { useAuthStore } from '../stores/auth-store';
import { Button } from '@restosaas/ui';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <div className='sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8'>
      <div className='flex flex-1 gap-x-4 self-stretch lg:gap-x-6'>
        <div className='flex flex-1'></div>
        <div className='flex items-center gap-x-4 lg:gap-x-6'>
          <div className='flex items-center gap-x-2'>
            <User className='h-5 w-5 text-gray-500' />
            <span className='text-sm font-medium text-gray-700'>
              {user?.displayName || user?.email}
            </span>
            <span className='text-xs text-gray-500 capitalize'>
              ({user?.role?.toLowerCase().replace('_', ' ')})
            </span>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={logout}
            className='flex items-center gap-x-2'
          >
            <LogOut className='h-4 w-4' />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
