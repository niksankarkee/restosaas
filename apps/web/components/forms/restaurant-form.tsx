'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api } from '@/lib/api';

const restaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  slogan: z.string().min(5, 'Slogan must be at least 5 characters'),
  place: z.string().min(2, 'Place must be at least 2 characters'),
  genre: z.string().min(2, 'Genre must be at least 2 characters'),
  budget: z.string().min(1, 'Budget is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  isOpen: z.boolean().default(true),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

interface RestaurantFormProps {
  initialData?: Partial<RestaurantFormData> & { id?: string };
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

const BUDGET_OPTIONS = [
  { value: '$', label: '$ - Budget Friendly' },
  { value: '$$', label: '$$ - Moderate' },
  { value: '$$$', label: '$$$ - Expensive' },
  { value: '$$$$', label: '$$$$ - Very Expensive' },
];

const GENRE_OPTIONS = [
  'Italian',
  'Chinese',
  'Japanese',
  'Indian',
  'Mexican',
  'American',
  'French',
  'Thai',
  'Mediterranean',
  'Korean',
  'Vietnamese',
  'Greek',
  'Spanish',
  'German',
  'Other',
];

export function RestaurantForm({
  initialData,
  onSuccess,
  onCancel,
  isEdit = false,
}: RestaurantFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: initialData?.name || '',
      slogan: initialData?.slogan || '',
      place: initialData?.place || '',
      genre: initialData?.genre || '',
      budget: initialData?.budget || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      capacity: initialData?.capacity || 30,
      isOpen: initialData?.isOpen ?? true,
    },
  });

  const onSubmit = async (data: RestaurantFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...data,
        description,
      };

      let response;
      if (isEdit && initialData?.id) {
        response = await api.put(
          `/owner/restaurants/${initialData.id}`,
          payload
        );
      } else {
        response = await api.post('/owner/restaurants', payload);
      }

      onSuccess?.(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save restaurant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Edit Restaurant' : 'Create Restaurant'}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? 'Update your restaurant information'
            : 'Add your restaurant to the platform'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Restaurant Name *</Label>
              <Input
                id='name'
                placeholder='The Golden Spoon'
                {...register('name')}
              />
              {errors.name && (
                <p className='text-sm text-red-600'>{errors.name.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='slogan'>Slogan *</Label>
              <Input
                id='slogan'
                placeholder='Where taste meets tradition'
                {...register('slogan')}
              />
              {errors.slogan && (
                <p className='text-sm text-red-600'>{errors.slogan.message}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='place'>Place/Location *</Label>
              <Input
                id='place'
                placeholder='Downtown, Kathmandu'
                {...register('place')}
              />
              {errors.place && (
                <p className='text-sm text-red-600'>{errors.place.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='genre'>Cuisine Genre *</Label>
              <select
                id='genre'
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                {...register('genre')}
              >
                <option value=''>Select cuisine type</option>
                {GENRE_OPTIONS.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              {errors.genre && (
                <p className='text-sm text-red-600'>{errors.genre.message}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='budget'>Budget Range *</Label>
              <select
                id='budget'
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                {...register('budget')}
              >
                <option value=''>Select budget range</option>
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.budget && (
                <p className='text-sm text-red-600'>{errors.budget.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='title'>Restaurant Title *</Label>
              <Input
                id='title'
                placeholder='Fine Dining Experience'
                {...register('title')}
              />
              {errors.title && (
                <p className='text-sm text-red-600'>{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label>Description</Label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder='Describe your restaurant, its history, specialties, and what makes it unique...'
            />
          </div>

          {/* Contact Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              <Input
                id='address'
                placeholder='123 Main Street, City'
                {...register('address')}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                id='phone'
                placeholder='+1 (555) 123-4567'
                {...register('phone')}
              />
            </div>
          </div>

          {/* Capacity and Status */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='capacity'>Capacity *</Label>
              <Input
                id='capacity'
                type='number'
                min='1'
                placeholder='30'
                {...register('capacity', { valueAsNumber: true })}
              />
              {errors.capacity && (
                <p className='text-sm text-red-600'>
                  {errors.capacity.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label>Restaurant Status</Label>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='isOpen'
                  className='rounded border-gray-300'
                  {...register('isOpen')}
                />
                <Label htmlFor='isOpen' className='text-sm'>
                  Restaurant is currently open
                </Label>
              </div>
            </div>
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
                ? 'Update Restaurant'
                : 'Create Restaurant'}
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
