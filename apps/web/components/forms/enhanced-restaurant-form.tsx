'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Camera, Upload, X, Star } from 'lucide-react';
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

const openingHourSchema = z.object({
  weekday: z.number().min(0).max(6),
  openTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  closeTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  isClosed: z.boolean().default(false),
});

const imageSchema = z.object({
  url: z.string().url('Invalid URL'),
  alt: z.string().optional(),
  isMain: z.boolean().default(false),
  displayOrder: z.number().default(0),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;
type OpeningHourData = z.infer<typeof openingHourSchema>;
type ImageData = z.infer<typeof imageSchema>;

interface EnhancedRestaurantFormProps {
  initialData?: Partial<RestaurantFormData> & {
    id?: string;
    openHours?: OpeningHourData[];
    images?: ImageData[];
  };
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

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

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function EnhancedRestaurantForm({
  initialData,
  onSuccess,
  onCancel,
  isEdit = false,
}: EnhancedRestaurantFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [openHours, setOpenHours] = useState<OpeningHourData[]>(
    initialData?.openHours ||
      Array.from({ length: 7 }, (_, i) => ({
        weekday: i,
        openTime: '09:00',
        closeTime: '22:00',
        isClosed: false,
      }))
  );
  const [images, setImages] = useState<ImageData[]>(initialData?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');

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

  const updateOpenHour = (
    index: number,
    field: keyof OpeningHourData,
    value: any
  ) => {
    const updated = [...openHours];
    updated[index] = { ...updated[index], [field]: value };
    setOpenHours(updated);
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;

    // Basic URL validation
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;
    if (!urlPattern.test(newImageUrl.trim())) {
      setError(
        'Please enter a valid image URL (must end with .jpg, .jpeg, .png, .webp, or .gif)'
      );
      return;
    }

    const newImage: ImageData = {
      url: newImageUrl.trim(),
      alt: `Restaurant image ${images.length + 1}`,
      isMain: images.length === 0, // First image is main by default
      displayOrder: images.length,
    };

    setImages([...images, newImage]);
    setNewImageUrl('');
    setError(''); // Clear any previous errors
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // If we removed the main image, make the first remaining image main
    if (images[index].isMain && updated.length > 0) {
      updated[0].isMain = true;
    }
    setImages(updated);
  };

  const setMainImage = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    setImages(updated);
  };

  const onSubmit = async (data: RestaurantFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...data,
        description,
        openHours,
        images,
      };

      let response;
      if (isEdit && initialData?.id) {
        response = await api.put(
          `/owner/restaurants/${initialData.id}`,
          payload
        );

        // Update opening hours separately
        if (openHours.length > 0) {
          await api.post(`/owner/restaurants/${initialData.id}/hours`, {
            openHours,
          });
        }

        // Update images separately
        if (images.length > 0) {
          await api.post(`/owner/restaurants/${initialData.id}/images`, {
            images,
          });
        }
      } else {
        response = await api.post('/owner/restaurants', payload);

        // Add opening hours and images for new restaurant
        if (response.data?.id) {
          if (openHours.length > 0) {
            await api.post(`/owner/restaurants/${response.data.id}/hours`, {
              openHours,
            });
          }
          if (images.length > 0) {
            await api.post(`/owner/restaurants/${response.data.id}/images`, {
              images,
            });
          }
        }
      }

      onSuccess?.(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save restaurant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-6xl mx-auto'>
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
        <Tabs defaultValue='basic' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='basic'>Basic Info</TabsTrigger>
            <TabsTrigger value='hours'>Opening Hours</TabsTrigger>
            <TabsTrigger value='images'>Images</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <TabsContent value='basic' className='space-y-6'>
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
                    <p className='text-sm text-red-600'>
                      {errors.name.message}
                    </p>
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
                    <p className='text-sm text-red-600'>
                      {errors.slogan.message}
                    </p>
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
                    <p className='text-sm text-red-600'>
                      {errors.place.message}
                    </p>
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
                    <p className='text-sm text-red-600'>
                      {errors.genre.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='budget'>Price Range (Rs) *</Label>
                  <Input
                    id='budget'
                    type='text'
                    placeholder='e.g., 500-1500 or 500 ~ 1500'
                    {...register('budget')}
                  />
                  <p className='text-sm text-gray-500'>
                    Enter price range in format: min-max (e.g., 500-1500) or min
                    ~ max (e.g., 500 ~ 1500)
                  </p>
                  {errors.budget && (
                    <p className='text-sm text-red-600'>
                      {errors.budget.message}
                    </p>
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
                    <p className='text-sm text-red-600'>
                      {errors.title.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className='space-y-2'>
                <Label>Description</Label>
                <RichTextEditor
                  value={description}
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
            </TabsContent>

            <TabsContent value='hours' className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-center space-x-2'>
                  <Clock className='h-5 w-5' />
                  <h3 className='text-lg font-semibold'>Opening Hours</h3>
                </div>
                <p className='text-sm text-gray-600'>
                  Set your restaurant's opening hours for each day of the week.
                </p>

                {/* Opening Hours Preview */}
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h4 className='text-sm font-semibold text-blue-900 mb-2'>
                    Opening Hours Preview
                  </h4>
                  <div className='space-y-1'>
                    {openHours.map((hour) => (
                      <div
                        key={hour.weekday}
                        className='flex justify-between text-sm'
                      >
                        <span className='font-medium'>
                          {WEEKDAYS[hour.weekday]}:
                        </span>
                        <span
                          className={
                            hour.isClosed ? 'text-red-600' : 'text-gray-700'
                          }
                        >
                          {hour.isClosed
                            ? 'Closed'
                            : `${hour.openTime} - ${hour.closeTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='space-y-4'>
                  {openHours.map((hour, index) => (
                    <div
                      key={hour.weekday}
                      className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50'
                    >
                      {/* Day Name */}
                      <div className='flex items-center'>
                        <Label className='text-sm font-semibold text-gray-900'>
                          {WEEKDAYS[hour.weekday]}
                        </Label>
                      </div>

                      {/* Closed Checkbox */}
                      <div className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          id={`closed-${hour.weekday}`}
                          checked={hour.isClosed}
                          onChange={(e) =>
                            updateOpenHour(index, 'isClosed', e.target.checked)
                          }
                          className='rounded border-gray-300'
                        />
                        <Label
                          htmlFor={`closed-${hour.weekday}`}
                          className='text-sm'
                        >
                          Closed on this day
                        </Label>
                      </div>

                      {/* Open Time */}
                      {!hour.isClosed && (
                        <>
                          <div className='space-y-1'>
                            <Label className='text-xs text-gray-600'>
                              Open Time
                            </Label>
                            <Input
                              type='time'
                              value={hour.openTime}
                              onChange={(e) =>
                                updateOpenHour(
                                  index,
                                  'openTime',
                                  e.target.value
                                )
                              }
                              className='w-full'
                            />
                          </div>
                          <div className='space-y-1'>
                            <Label className='text-xs text-gray-600'>
                              Close Time
                            </Label>
                            <Input
                              type='time'
                              value={hour.closeTime}
                              onChange={(e) =>
                                updateOpenHour(
                                  index,
                                  'closeTime',
                                  e.target.value
                                )
                              }
                              className='w-full'
                            />
                          </div>
                        </>
                      )}

                      {/* Show closed message when closed */}
                      {hour.isClosed && (
                        <div className='md:col-span-2 flex items-center'>
                          <span className='text-sm text-red-600 font-medium'>
                            Restaurant is closed on {WEEKDAYS[hour.weekday]}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value='images' className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-center space-x-2'>
                  <Camera className='h-5 w-5' />
                  <h3 className='text-lg font-semibold'>Restaurant Images</h3>
                </div>
                <p className='text-sm text-gray-600'>
                  Add images of your restaurant by entering image URLs. The
                  first image will be used as the main image.
                </p>

                {/* Add Image URL */}
                <div className='space-y-4'>
                  <div className='flex space-x-2'>
                    <Input
                      type='url'
                      placeholder='Enter image URL (e.g., https://example.com/image.jpg)'
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className='flex-1'
                    />
                    <Button
                      type='button'
                      onClick={addImage}
                      disabled={!newImageUrl.trim()}
                    >
                      <Upload className='h-4 w-4 mr-2' />
                      Add Image
                    </Button>
                  </div>

                  {/* Image URL Help */}
                  <div className='bg-blue-50 p-3 rounded-lg'>
                    <p className='text-sm text-blue-800'>
                      <strong>Tip:</strong> You can use image hosting services
                      like:
                    </p>
                    <ul className='text-sm text-blue-700 mt-1 ml-4 list-disc'>
                      <li>Imgur, Cloudinary, or AWS S3</li>
                      <li>
                        Make sure the URL ends with .jpg, .jpeg, .png, or .webp
                      </li>
                      <li>Use high-quality images (at least 800x600 pixels)</li>
                    </ul>
                  </div>
                </div>

                {/* Image Gallery */}
                {images.length > 0 && (
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                    {images.map((image, index) => (
                      <div key={index} className='relative group'>
                        <div className='aspect-square rounded-lg overflow-hidden bg-gray-100'>
                          <img
                            src={image.url}
                            alt={image.alt || `Restaurant image ${index + 1}`}
                            className='w-full h-full object-cover'
                          />
                        </div>

                        {image.isMain && (
                          <Badge className='absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600'>
                            <Star className='h-3 w-3 mr-1' />
                            Main
                          </Badge>
                        )}

                        <div className='absolute top-2 right-2 flex space-x-1'>
                          {!image.isMain && (
                            <Button
                              type='button'
                              size='sm'
                              variant='secondary'
                              onClick={() => setMainImage(index)}
                              className='h-8 w-8 p-0'
                            >
                              <Star className='h-3 w-3' />
                            </Button>
                          )}
                          <Button
                            type='button'
                            size='sm'
                            variant='destructive'
                            onClick={() => removeImage(index)}
                            className='h-8 w-8 p-0'
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {error && (
              <div className='text-sm text-red-600 bg-red-50 p-3 rounded-md'>
                {error}
              </div>
            )}

            <div className='flex gap-2 pt-6 border-t'>
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
        </Tabs>
      </CardContent>
    </Card>
  );
}
