'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationFormProps {
  initialData?: {
    id: string;
    name: string;
  };
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function OrganizationForm({
  initialData,
  onSuccess,
  onCancel,
}: OrganizationFormProps) {
  const isEdit = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: initialData?.name || '',
    },
  });

  const onSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true);
    setError('');

    try {
      let response;
      if (isEdit) {
        response = await api.put('/organizations/me', data);
      } else {
        response = await api.post('/organizations', data);
      }

      onSuccess?.(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Edit Organization' : 'Create Organization'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Organization Name *</Label>
            <Input
              id='name'
              placeholder='My Restaurant Group'
              {...register('name')}
            />
            {errors.name && (
              <p className='text-sm text-red-600'>{errors.name.message}</p>
            )}
          </div>

          {error && (
            <div className='text-sm text-red-600 bg-red-50 p-3 rounded-md'>
              {error}
            </div>
          )}

          <div className='flex gap-2'>
            <Button type='submit' disabled={isLoading} className='flex-1'>
              {isLoading
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                ? 'Update Organization'
                : 'Create Organization'}
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
