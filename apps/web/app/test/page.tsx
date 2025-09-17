'use client';

import { useAuth } from '@/contexts/auth-context';

export default function TestPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Test Page</h1>
      {user ? (
        <div>
          <p>Welcome, {user.displayName || user.email}!</p>
          <p>Role: {user.role}</p>
          {user.role === 'SUPER_ADMIN' && (
            <a
              href='/super-admin-dashboard'
              className='text-blue-600 underline'
            >
              Go to Super Admin Dashboard
            </a>
          )}
        </div>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
