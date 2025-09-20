import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@restosaas/ui';
import { Input } from '@restosaas/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import { api as apiClient } from '../../lib/api-client';
import { EnhancedRestaurantDialog } from '../../components/enhanced-restaurant-dialog';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin,
  Star,
  Clock,
  Eye,
} from 'lucide-react';
import type { Restaurant, CreateRestaurantRequest, UpdateRestaurantRequest, RestaurantResponse } from '@restosaas/types';

export function OwnerRestaurants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );
  const queryClient = useQueryClient();

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['owner-restaurants'],
    queryFn: () => apiClient.getMyRestaurants(),
  });

  const createRestaurantMutation = useMutation({
    mutationFn: (data: CreateRestaurantRequest) => apiClient.createRestaurant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-restaurants'] });
      setIsCreateDialogOpen(false);
    },
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRestaurantRequest }) =>
      apiClient.updateRestaurant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-restaurants'] });
      setIsEditDialogOpen(false);
      setEditingRestaurant(null);
    },
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-restaurants'] });
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
          <h1 className='text-2xl font-bold text-gray-900'>My Restaurants</h1>
          <p className='text-gray-600'>Manage your restaurant portfolio</p>
        </div>
        {(!restaurants || restaurants.length === 0) && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='w-4 h-4 mr-2' />
            Add Restaurant
          </Button>
        )}
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
        {filteredRestaurants.map((restaurant) => (
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
                      // TODO: Navigate to restaurant detail page
                      console.log('View restaurant:', restaurant.id);
                    }}
                  >
                    <Eye className='w-4 h-4' />
                  </Button>
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
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {restaurants && restaurants.length > 0
                ? 'No restaurants found matching your search'
                : 'No restaurants found'}
            </h3>
            <p className='text-gray-600 mb-4'>
              {restaurants && restaurants.length > 0
                ? 'Try adjusting your search terms.'
                : 'Get started by creating your first restaurant.'}
            </p>
            {(!restaurants || restaurants.length === 0) && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Restaurant
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Restaurant Dialog */}
      <EnhancedRestaurantDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={(data) => createRestaurantMutation.mutate(data)}
        isLoading={createRestaurantMutation.isPending}
        title='Create Restaurant'
      />

      {/* Edit Restaurant Dialog */}
      <EnhancedRestaurantDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingRestaurant(null);
        }}
        onSubmit={(data) =>
          updateRestaurantMutation.mutate({ id: editingRestaurant?.id, data })
        }
        isLoading={updateRestaurantMutation.isPending}
        initialData={editingRestaurant}
        title='Edit Restaurant'
      />
    </div>
  );
}
