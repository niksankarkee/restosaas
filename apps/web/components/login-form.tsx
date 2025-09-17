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
import { Chrome, Facebook, Twitter } from 'lucide-react';

interface LoginFormProps extends React.ComponentPropsWithoutRef<'div'> {
  onSuccess?: (user: any) => void;
}

export function LoginForm({ className, onSuccess, ...props }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'CUSTOMER',
  });
  const { login } = useAuth();

  // Email validation regex
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 4 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');

    // Validate fields on change
    if (name === 'email') {
      validateEmail(value);
    } else if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleOAuthLogin = async (
    provider: 'google' | 'facebook' | 'twitter'
  ) => {
    setIsOAuthLoading(provider);
    setError('');

    try {
      // Get OAuth authorization URL
      const authUrl = getOAuthUrl(provider);

      // Open OAuth popup
      const popup = window.open(
        authUrl,
        'oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'OAUTH_SUCCESS') {
          const { code } = event.data;

          try {
            // Send code to backend
            const { data } = await api.post(`/auth/oauth/${provider}`, {
              code,
            });

            // Store token and user data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Update auth context
            // Trigger a re-login to update context
            window.location.reload();

            onSuccess?.(data.user);
            popup.close();
            window.removeEventListener('message', handleMessage);
          } catch (err: any) {
            setError(
              err.response?.data?.error || `Failed to login with ${provider}`
            );
            popup.close();
            window.removeEventListener('message', handleMessage);
          }
        } else if (event.data.type === 'OAUTH_ERROR') {
          setError(event.data.error || `Failed to login with ${provider}`);
          popup.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Cleanup if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsOAuthLoading(null);
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || `Failed to login with ${provider}`);
    } finally {
      setIsOAuthLoading(null);
    }
  };

  const getOAuthUrl = (provider: 'google' | 'facebook' | 'twitter'): string => {
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/auth/callback/${provider}`;

    switch (provider) {
      case 'google':
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=code&scope=openid%20email%20profile&access_type=offline`;

      case 'facebook':
        const facebookClientId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID;
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookClientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=code&scope=email,public_profile`;

      case 'twitter':
        const twitterClientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
        return `https://twitter.com/i/oauth2/authorize?client_id=${twitterClientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=code&scope=tweet.read%20users.read%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`;

      default:
        throw new Error('Unsupported OAuth provider');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate fields before submitting
    if (
      !validateEmail(formData.email) ||
      !validatePassword(formData.password)
    ) {
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login using auth context
        await login(formData.email, formData.password);
        // Only call onSuccess if login was successful
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
        // Only call onSuccess if signup was successful
        onSuccess?.(data);
      }
    } catch (err: any) {
      // Set error message and do NOT call onSuccess
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
                  className={
                    emailError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : ''
                  }
                />
                {emailError && (
                  <p className='text-sm text-red-600'>{emailError}</p>
                )}
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
                  className={
                    passwordError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : ''
                  }
                />
                {passwordError && (
                  <p className='text-sm text-red-600'>{passwordError}</p>
                )}
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

              <Button
                type='submit'
                className='w-full'
                disabled={
                  isLoading ||
                  isOAuthLoading !== null ||
                  !!emailError ||
                  !!passwordError
                }
              >
                {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
              </Button>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-2 text-muted-foreground'>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-1 gap-3'>
                <Button
                  variant='outline'
                  type='button'
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isLoading || isOAuthLoading !== null}
                  className='w-full'
                >
                  {isOAuthLoading === 'google' ? (
                    'Loading...'
                  ) : (
                    <>
                      <Chrome className='mr-2 h-4 w-4' />
                      {isLogin ? 'Login' : 'Sign up'} with Google
                    </>
                  )}
                </Button>

                <Button
                  variant='outline'
                  type='button'
                  onClick={() => handleOAuthLogin('facebook')}
                  disabled={isLoading || isOAuthLoading !== null}
                  className='w-full'
                >
                  {isOAuthLoading === 'facebook' ? (
                    'Loading...'
                  ) : (
                    <>
                      <Facebook className='mr-2 h-4 w-4' />
                      {isLogin ? 'Login' : 'Sign up'} with Facebook
                    </>
                  )}
                </Button>

                <Button
                  variant='outline'
                  type='button'
                  onClick={() => handleOAuthLogin('twitter')}
                  disabled={isLoading || isOAuthLoading !== null}
                  className='w-full'
                >
                  {isOAuthLoading === 'twitter' ? (
                    'Loading...'
                  ) : (
                    <>
                      <Twitter className='mr-2 h-4 w-4' />
                      {isLogin ? 'Login' : 'Sign up'} with Twitter
                    </>
                  )}
                </Button>
              </div>
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
                  setEmailError('');
                  setPasswordError('');
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
