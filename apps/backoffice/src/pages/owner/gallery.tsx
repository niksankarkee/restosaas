import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import { api as apiClient } from '../../lib/api-client';
import { RestaurantGallery } from '../../components/restaurant-gallery';
import { LoadingSpinner } from '../../components/loading-spinner';
import type { RestaurantResponse } from '@restosaas/types';

export function OwnerGallery() {
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantResponse | null>(null);

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['owner-restaurants'],
    queryFn: () => apiClient.getMyRestaurants(),
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner />
      </div>
    );
  }

  if (
    !restaurants?.data?.restaurants ||
    restaurants.data.restaurants.length === 0
  ) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Restaurant Gallery
          </h1>
          <p className='text-gray-600'>Manage your restaurant images</p>
        </div>
        <Card>
          <CardContent className='text-center py-12'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              No restaurants found
            </h3>
            <p className='text-gray-600'>
              You need to create a restaurant first before managing images.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If only one restaurant, auto-select it
  if (restaurants.data.restaurants.length === 1 && !selectedRestaurant) {
    setSelectedRestaurant(restaurants.data.restaurants[0]);
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Restaurant Gallery</h1>
        <p className='text-gray-600'>Manage your restaurant images</p>
      </div>

      {/* Restaurant Selection */}
      {restaurants.data.restaurants.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {restaurants.data.restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRestaurant?.id === restaurant.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRestaurant(restaurant)}
                >
                  <h3 className='font-medium text-gray-900'>
                    {restaurant.name}
                  </h3>
                  <p className='text-sm text-gray-500'>{restaurant.place}</p>
                  {restaurant.images && restaurant.images.length > 0 && (
                    <p className='text-xs text-gray-400 mt-1'>
                      {restaurant.images.length} image
                      {restaurant.images.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Management */}
      {selectedRestaurant && (
        <RestaurantGallery
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.name}
          images={selectedRestaurant.images || []}
          onImagesChange={(newImages) => {
            // Update the local state
            if (restaurants?.data?.restaurants) {
              const updatedRestaurants = restaurants.data.restaurants.map(
                (restaurant) =>
                  restaurant.id === selectedRestaurant.id
                    ? { ...restaurant, images: newImages }
                    : restaurant
              );
              // This would ideally update the query cache, but for now we'll just update local state
              setSelectedRestaurant({
                ...selectedRestaurant,
                images: newImages,
              });
            }
          }}
        />
      )}
    </div>
  );
}
