'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import { Star, MapPin, Clock } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  place: string;
  genre: string;
  budget: string;
  description: string;
  avg_rating: number;
  review_count: number;
  isOpen: boolean;
  images: Array<{
    ID: string;
    URL: string;
    Alt: string;
    IsMain: boolean;
  }>;
}

export function RestaurantGrid() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching restaurants from API...');
      const response = await fetch('/api/restaurants');
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch restaurants: ${response.status}`);
      }
      const data = await response.json();
      console.log('Restaurants data:', data);
      setRestaurants(data.restaurants || []);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPriceRange = (budget: string): string => {
    if (budget && (budget.includes('-') || budget.includes('~'))) {
      return `Rs (${budget})`;
    }
    if (budget && !budget.includes('$')) {
      return `Rs (${budget})`;
    }
    return budget.replace(/\$/g, 'Rs ');
  };

  if (isLoading) {
    return (
      <div>
        <h2 className='text-xl font-semibold mb-4'>Restaurants</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className='animate-pulse'>
              <div className='bg-white rounded-lg shadow p-6'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-1/2 mb-4'></div>
                <div className='h-3 bg-gray-200 rounded w-1/4'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className='text-xl font-semibold mb-4'>Restaurants</h2>
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div>
        <h2 className='text-xl font-semibold mb-4'>Restaurants</h2>
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <p className='text-gray-600'>No restaurants found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className='text-xl font-semibold mb-4'>Restaurants</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {restaurants.map((restaurant) => {
          const mainImage =
            restaurant.images?.find((img) => img.IsMain) ||
            restaurant.images?.[0];

          return (
            <Link key={restaurant.id} href={`/r/${restaurant.slug}`}>
              <Card className='overflow-hidden hover:shadow-lg transition-shadow cursor-pointer'>
                {mainImage && (
                  <div className='aspect-video overflow-hidden'>
                    <img
                      src={mainImage.URL}
                      alt={mainImage.Alt || restaurant.name}
                      className='w-full h-full object-cover'
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className='text-lg'>{restaurant.name}</CardTitle>
                  <div className='flex items-center text-gray-600 text-sm'>
                    <MapPin className='h-4 w-4 mr-1' />
                    <span>{restaurant.place}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center justify-between mb-2'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        restaurant.isOpen
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {restaurant.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  {restaurant.avg_rating > 0 && (
                    <div className='flex items-center'>
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400 mr-1' />
                      <span className='text-sm font-medium'>
                        {restaurant.avg_rating.toFixed(1)} (
                        {restaurant.review_count})
                      </span>
                    </div>
                  )}
                  <div className='flex items-center justify-between text-sm text-gray-500'>
                    <span>{restaurant.genre}</span>
                    <span>{formatPriceRange(restaurant.budget)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
