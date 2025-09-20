import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@restosaas/ui';
import { Input } from '@restosaas/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@restosaas/ui';
import { api as apiClient } from '../../lib/api-client';
import { Plus, Edit, Trash2, Search, MapPin, Star } from 'lucide-react';
import type {
  Restaurant,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  RestaurantResponse,
} from '@restosaas/types';

export function AdminRestaurants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );
  const queryClient = useQueryClient();

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: () => apiClient.getAllRestaurants(),
  });

  const createRestaurantMutation = useMutation({
    mutationFn: (data: CreateRestaurantRequest) =>
      apiClient.createRestaurant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      setIsCreateDialogOpen(false);
    },
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRestaurantRequest }) =>
      apiClient.updateRestaurant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      setIsEditDialogOpen(false);
      setEditingRestaurant(null);
    },
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
  });

  const filteredRestaurants =
    restaurants?.data?.restaurants?.filter(
      (restaurant: RestaurantResponse) =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.place.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Restaurants</h1>
          <p className='text-gray-600'>Manage all restaurants in the system</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='w-4 h-4 mr-2' />
          Add Restaurant
        </Button>
      </div>

      <div className='flex items-center space-x-2'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            placeholder='Search restaurants...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredRestaurants.map((restaurant: RestaurantResponse) => (
          <Card key={restaurant.id} className='overflow-hidden'>
            {restaurant.images && restaurant.images.length > 0 && (
              <div className='aspect-video overflow-hidden'>
                <img
                  src={restaurant.images[0].url}
                  alt={restaurant.name}
                  className='w-full h-full object-cover'
                />
              </div>
            )}
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-lg'>{restaurant.name}</CardTitle>
                  <div className='flex items-center text-gray-500 text-sm mt-1'>
                    <MapPin className='h-4 w-4 mr-1' />
                    <span>{restaurant.place}</span>
                  </div>
                </div>
                <div className='flex space-x-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setEditingRestaurant(restaurant);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className='w-4 h-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to delete this restaurant?'
                        )
                      ) {
                        deleteRestaurantMutation.mutate(restaurant.id);
                      }
                    }}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-500'>Status:</span>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      restaurant.isOpen
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-500'>Rating:</span>
                  <div className='flex items-center'>
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400 mr-1' />
                    <span className='text-sm font-medium'>
                      {restaurant.avgRating > 0
                        ? restaurant.avgRating.toFixed(1)
                        : 'N/A'}
                    </span>
                    <span className='text-sm text-gray-500 ml-1'>
                      ({restaurant.reviewCount})
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-500'>Capacity:</span>
                  <span className='text-sm text-gray-600'>
                    {restaurant.capacity} people
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-500'>Genre:</span>
                  <span className='text-sm text-gray-600'>
                    {restaurant.genre || 'N/A'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-500'>Budget:</span>
                  <span className='text-sm text-gray-600'>
                    {restaurant.budget || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <Card>
          <CardContent className='text-center py-12'>
            <p className='text-gray-500'>No restaurants found</p>
          </CardContent>
        </Card>
      )}

      {/* Create Restaurant Dialog */}
      {isCreateDialogOpen && (
        <CreateRestaurantDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={(data) => createRestaurantMutation.mutate(data)}
          isLoading={createRestaurantMutation.isPending}
        />
      )}

      {/* Edit Restaurant Dialog */}
      {isEditDialogOpen && editingRestaurant && (
        <EditRestaurantDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingRestaurant(null);
          }}
          restaurant={editingRestaurant}
          onSubmit={(data) =>
            updateRestaurantMutation.mutate({ id: editingRestaurant.id, data })
          }
          isLoading={updateRestaurantMutation.isPending}
        />
      )}
    </div>
  );
}

// Create Restaurant Dialog Component
function CreateRestaurantDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRestaurantRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateRestaurantRequest>({
    name: '',
    slogan: '',
    place: '',
    genre: '',
    budget: '',
    title: '',
    description: '',
    address: '',
    phone: '',
    timezone: 'UTC',
    capacity: 50,
    isOpen: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create Restaurant</DialogTitle>
        </DialogHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
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
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Budget
                </label>
                <Input
                  type='text'
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
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
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Timezone *
              </label>
              <Input
                type='text'
                value={formData.timezone}
                onChange={(e) =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
                placeholder='UTC'
                required
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
                      capacity: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className='flex items-center space-x-2'>
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
                  Restaurant is open
                </label>
              </div>
            </div>

            <div className='flex justify-end space-x-2'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Restaurant'}
              </Button>
            </div>
          </form>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}

// Edit Restaurant Dialog Component
function EditRestaurantDialog({
  isOpen,
  onClose,
  restaurant,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onSubmit: (data: UpdateRestaurantRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<UpdateRestaurantRequest>({
    name: restaurant.name,
    slogan: restaurant.slogan || '',
    place: restaurant.place,
    genre: restaurant.genre || '',
    budget: restaurant.budget || '',
    title: restaurant.title || '',
    description: restaurant.description || '',
    address: restaurant.address || '',
    phone: restaurant.phone || '',
    timezone: restaurant.timezone || 'UTC',
    capacity: restaurant.capacity,
    isOpen: restaurant.isOpen,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit Restaurant</DialogTitle>
        </DialogHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
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
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Budget
                </label>
                <Input
                  type='text'
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
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
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Timezone *
              </label>
              <Input
                type='text'
                value={formData.timezone}
                onChange={(e) =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
                placeholder='UTC'
                required
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
                      capacity: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className='flex items-center space-x-2'>
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
                  Restaurant is open
                </label>
              </div>
            </div>

            <div className='flex justify-end space-x-2'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Restaurant'}
              </Button>
            </div>
          </form>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
