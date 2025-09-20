'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api } from '@/lib/api';

const createOwnerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  orgName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

type CreateOwnerFormData = z.infer<typeof createOwnerSchema>;

interface CreateOwnerFormProps {
  onSuccess?: (data: { id: string; name: string; email: string }) => void;
  onCancel?: () => void;
}

export function CreateOwnerForm({ onSuccess, onCancel }: CreateOwnerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOwnerFormData>({
    resolver: zodResolver(createOwnerSchema),
  });

  const onSubmit = async (data: CreateOwnerFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/super-admin/owners', data);
      onSuccess?.(response.data);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : 'Failed to create owner';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Create Owner</CardTitle>
        <CardDescription>
          Create a new restaurant owner with organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='owner@example.com'
              {...register('email')}
            />
            {errors.email && (
              <p className='text-sm text-red-600'>{errors.email.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              placeholder='Enter password'
              {...register('password')}
            />
            {errors.password && (
              <p className='text-sm text-red-600'>{errors.password.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='displayName'>Display Name</Label>
            <Input
              id='displayName'
              type='text'
              placeholder='John Doe'
              {...register('displayName')}
            />
            {errors.displayName && (
              <p className='text-sm text-red-600'>
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='orgName'>Organization Name</Label>
            <Input
              id='orgName'
              type='text'
              placeholder='Restaurant Group Inc.'
              {...register('orgName')}
            />
            {errors.orgName && (
              <p className='text-sm text-red-600'>{errors.orgName.message}</p>
            )}
          </div>

          {error && (
            <div className='text-sm text-red-600 bg-red-50 p-3 rounded-md'>
              {error}
            </div>
          )}

          <div className='flex gap-2'>
            <Button type='submit' disabled={isLoading} className='flex-1'>
              {isLoading ? 'Creating...' : 'Create Owner'}
            </Button>
            {onCancel && (
              <Button type='button' variant='outline' onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
