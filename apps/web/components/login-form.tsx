'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

interface LoginFormProps extends React.ComponentPropsWithoutRef<'div'> {
  onSuccess?: (user: any) => void;
}

export function LoginForm({ className, onSuccess, ...props }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'CUSTOMER',
  });
  const { login } = useAuth();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login using auth context
        await login(formData.email, formData.password);
        onSuccess?.(null); // Auth context will handle user state
      } else {
        // Signup
        const { data } = await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          role: formData.role,
        });

        localStorage.setItem('authToken', data.token);
        onSuccess?.(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>
            {isLogin ? 'Login' : 'Sign Up'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Enter your email below to login to your account'
              : 'Create a new account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className='flex flex-col gap-6'>
              {!isLogin && (
                <div className='grid gap-2'>
                  <Label htmlFor='displayName'>Display Name</Label>
                  <Input
                    id='displayName'
                    name='displayName'
                    type='text'
                    placeholder='John Doe'
                    value={formData.displayName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className='grid gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='m@example.com'
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className='grid gap-2'>
                <div className='flex items-center'>
                  <Label htmlFor='password'>Password</Label>
                  {isLogin && (
                    <a
                      href='#'
                      className='ml-auto inline-block text-sm underline-offset-4 hover:underline'
                    >
                      Forgot your password?
                    </a>
                  )}
                </div>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {!isLogin && (
                <div className='grid gap-2'>
                  <Label htmlFor='role'>Role</Label>
                  <select
                    id='role'
                    name='role'
                    value={formData.role}
                    onChange={handleInputChange}
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    <option value='CUSTOMER'>Customer</option>
                    <option value='OWNER'>Owner</option>
                    <option value='SUPER_ADMIN'>Super Admin</option>
                  </select>
                </div>
              )}

              {error && (
                <div className='text-sm text-red-600 bg-red-50 p-3 rounded-md'>
                  {error}
                </div>
              )}

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
              </Button>

              <Button variant='outline' className='w-full' type='button'>
                {isLogin ? 'Login' : 'Sign up'} with Google
              </Button>
            </div>

            <div className='mt-4 text-center text-sm'>
              {isLogin
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                type='button'
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className='underline underline-offset-4 hover:text-primary'
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
