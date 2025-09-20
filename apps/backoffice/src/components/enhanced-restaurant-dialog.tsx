import { useState } from 'react';
import { Button } from '@restosaas/ui';
import { Input } from '@restosaas/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@restosaas/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@restosaas/ui';
import { RichTextEditor } from './rich-text-editor';
import { Plus, Trash2, Clock, Upload, Image as ImageIcon } from 'lucide-react';
import type { CreateRestaurantRequest, UpdateRestaurantRequest, Restaurant } from '@restosaas/types';

interface EnhancedRestaurantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRestaurantRequest | UpdateRestaurantRequest) => void;
  isLoading: boolean;
  initialData?: Restaurant;
  title?: string;
}

interface OpeningHour {
  weekday: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function EnhancedRestaurantDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
  title = 'Create Restaurant',
}: EnhancedRestaurantDialogProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slogan: initialData?.slogan || '',
    place: initialData?.place || '',
    genre: initialData?.genre || '',
    budget: initialData?.budget || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    capacity: initialData?.capacity || 50,
    isOpen: initialData?.isOpen ?? true,
    timezone: initialData?.timezone || 'UTC',
  });

  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(
    initialData?.openingHours || [
      { weekday: 1, openTime: '09:00', closeTime: '22:00', isClosed: false },
      { weekday: 2, openTime: '09:00', closeTime: '22:00', isClosed: false },
      { weekday: 3, openTime: '09:00', closeTime: '22:00', isClosed: false },
      { weekday: 4, openTime: '09:00', closeTime: '22:00', isClosed: false },
      { weekday: 5, openTime: '09:00', closeTime: '22:00', isClosed: false },
      { weekday: 6, openTime: '09:00', closeTime: '22:00', isClosed: false },
      { weekday: 0, openTime: '09:00', closeTime: '22:00', isClosed: false },
    ]
  );

  const [images, setImages] = useState<
    Array<{ url: string; alt: string; isMain: boolean }>
  >(initialData?.images || []);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      openingHours,
      images,
    };
    onSubmit(submitData);
  };

  const handleOpeningHourChange = (
    index: number,
    field: keyof OpeningHour,
    value: string | boolean
  ) => {
    const updated = [...openingHours];
    updated[index] = { ...updated[index], [field]: value };
    setOpeningHours(updated);
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      const newImage = {
        url: newImageUrl.trim(),
        alt: newImageAlt.trim() || 'Restaurant image',
        isMain: images.length === 0, // First image is main by default
      };
      setImages([...images, newImage]);
      setNewImageUrl('');
      setNewImageAlt('');
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>{title}</DialogTitle>
        </DialogHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='basic'>Basic Info</TabsTrigger>
                <TabsTrigger value='details'>Details</TabsTrigger>
                <TabsTrigger value='hours'>Opening Hours</TabsTrigger>
                <TabsTrigger value='images'>Images</TabsTrigger>
              </TabsList>

              <TabsContent value='basic' className='mt-6 space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Restaurant Name *
                    </label>
                    <Input
                      type='text'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Place *
                    </label>
                    <Input
                      type='text'
                      value={formData.place}
                      onChange={(e) =>
                        setFormData({ ...formData, place: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Genre
                    </label>
                    <Input
                      type='text'
                      value={formData.genre}
                      onChange={(e) =>
                        setFormData({ ...formData, genre: e.target.value })
                      }
                      placeholder='e.g., Italian, Japanese, Fast Food'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Budget Range
                    </label>
                    <Input
                      type='text'
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                      placeholder='e.g., 500-1500, $10-30'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Slogan
                  </label>
                  <Input
                    type='text'
                    value={formData.slogan}
                    onChange={(e) =>
                      setFormData({ ...formData, slogan: e.target.value })
                    }
                    placeholder='e.g., "Best Pizza in Town"'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Capacity *
                    </label>
                    <Input
                      type='number'
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value) || 50,
                        })
                      }
                      required
                    />
                  </div>
                  <div className='flex items-center space-x-2 mt-6'>
                    <input
                      type='checkbox'
                      id='isOpen'
                      checked={formData.isOpen}
                      onChange={(e) =>
                        setFormData({ ...formData, isOpen: e.target.checked })
                      }
                      className='rounded'
                    />
                    <label
                      htmlFor='isOpen'
                      className='text-sm font-medium text-gray-700'
                    >
                      Restaurant is currently open
                    </label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='details' className='mt-6 space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Title
                  </label>
                  <Input
                    type='text'
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder='e.g., "Authentic Italian Cuisine"'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Description (Rich Text)
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) =>
                      setFormData({ ...formData, description: value })
                    }
                    placeholder='Write a detailed description of your restaurant...'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Address
                    </label>
                    <Input
                      type='text'
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder='Full street address'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Phone
                    </label>
                    <Input
                      type='text'
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder='Phone number'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Timezone
                  </label>
                  <Input
                    type='text'
                    value={formData.timezone}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
                    }
                    placeholder='e.g., UTC, America/New_York'
                  />
                </div>
              </TabsContent>

              <TabsContent value='hours' className='mt-6 space-y-4'>
                <div className='space-y-4'>
                  {openingHours.map((hour, index) => (
                    <div
                      key={hour.weekday}
                      className='flex items-center space-x-4 p-4 border rounded-lg'
                    >
                      <div className='w-24'>
                        <span className='font-medium'>
                          {WEEKDAYS[hour.weekday]}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          checked={hour.isClosed}
                          onChange={(e) =>
                            handleOpeningHourChange(
                              index,
                              'isClosed',
                              e.target.checked
                            )
                          }
                          className='rounded'
                        />
                        <label className='text-sm text-gray-700'>Closed</label>
                      </div>
                      {!hour.isClosed && (
                        <>
                          <div>
                            <label className='block text-xs text-gray-500 mb-1'>
                              Open
                            </label>
                            <Input
                              type='time'
                              value={hour.openTime}
                              onChange={(e) =>
                                handleOpeningHourChange(
                                  index,
                                  'openTime',
                                  e.target.value
                                )
                              }
                              className='w-32'
                            />
                          </div>
                          <div>
                            <label className='block text-xs text-gray-500 mb-1'>
                              Close
                            </label>
                            <Input
                              type='time'
                              value={hour.closeTime}
                              onChange={(e) =>
                                handleOpeningHourChange(
                                  index,
                                  'closeTime',
                                  e.target.value
                                )
                              }
                              className='w-32'
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='images' className='mt-6 space-y-4'>
                <div className='space-y-4'>
                  <div className='flex space-x-2'>
                    <Input
                      type='url'
                      placeholder='Image URL'
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className='flex-1'
                    />
                    <Input
                      type='text'
                      placeholder='Alt text'
                      value={newImageAlt}
                      onChange={(e) => setNewImageAlt(e.target.value)}
                      className='flex-1'
                    />
                    <Button
                      type='button'
                      onClick={addImage}
                      disabled={!newImageUrl.trim()}
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add
                    </Button>
                  </div>

                  {images.length > 0 && (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {images.map((image, index) => (
                        <div
                          key={index}
                          className='relative group border rounded-lg overflow-hidden'
                        >
                          <img
                            src={image.url}
                            alt={image.alt}
                            className='w-full h-32 object-cover'
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://via.placeholder.com/300x200?text=Image+Not+Found';
                            }}
                          />
                          <div className='p-3'>
                            <p className='text-sm font-medium truncate'>
                              {image.alt}
                            </p>
                            <div className='flex items-center justify-between mt-2'>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  image.isMain
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {image.isMain ? 'Main Image' : 'Gallery'}
                              </span>
                              <div className='flex space-x-1'>
                                {!image.isMain && (
                                  <Button
                                    type='button'
                                    size='sm'
                                    variant='outline'
                                    onClick={() => setMainImage(index)}
                                  >
                                    <ImageIcon className='w-3 h-3' />
                                  </Button>
                                )}
                                <Button
                                  type='button'
                                  size='sm'
                                  variant='outline'
                                  onClick={() => removeImage(index)}
                                >
                                  <Trash2 className='w-3 h-3' />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {images.length === 0 && (
                    <div className='text-center py-8 text-gray-500'>
                      <ImageIcon className='w-12 h-12 mx-auto mb-2 text-gray-300' />
                      <p>No images added yet</p>
                      <p className='text-sm'>
                        Add images to showcase your restaurant
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className='flex justify-end space-x-2 pt-6 border-t'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading
                  ? 'Saving...'
                  : initialData
                  ? 'Update Restaurant'
                  : 'Create Restaurant'}
              </Button>
            </div>
          </form>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
