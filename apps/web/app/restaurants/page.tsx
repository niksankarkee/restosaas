'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import {
  Star,
  MapPin,
  DollarSign,
  Clock,
  Utensils,
  Eye,
  Calendar,
  MessageSquare,
  Search,
  Users,
} from 'lucide-react';
import { APP_TEXT } from '@/lib/constants';

interface Restaurant {
  id: string;
  slug: string;
  name: string;
  slogan: string;
  place: string;
  genre: string;
  budget: string;
  description?: string;
  is_open: boolean;
  capacity: number;
  main_image_id?: string;
  images?: Array<{
    ID: string;
    URL: string;
    Alt: string;
    IsMain: boolean;
  }>;
  avg_rating: number;
  review_count: number;
  open_hours?: Array<{
    Weekday: number;
    OpenTime: string;
    CloseTime: string;
    IsClosed: boolean;
  }>;
}

export default function Restaurants() {
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showingFallback, setShowingFallback] = useState(false);

  // Extract search parameters from URL
  const area = searchParams.get('area') || '';
  const cuisine = searchParams.get('cuisine') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const people = searchParams.get('people') || '';
  const budget = searchParams.get('budget') || '';

  const hasSearchParams = area || cuisine || date || time || people || budget;

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const params: any = {};

        if (area) params.area = area;
        if (cuisine) params.cuisine = cuisine;
        if (date) params.date = date;
        if (time) params.time = time;
        if (people) params.people = people;
        if (budget) params.budget = budget;

        const { data } = await api.get('/restaurants', { params });
        // Extract restaurants array from response
        const safeItems = Array.isArray(data?.restaurants)
          ? data.restaurants
          : [];
        console.log('API Response:', data);
        console.log('Restaurants found:', safeItems.length);

        // If search returned no results but we have search parameters,
        // fetch all restaurants as fallback recommendations
        if (safeItems.length === 0 && hasSearchParams) {
          const { data: allData } = await api.get('/restaurants');
          const allItems = Array.isArray(allData?.restaurants)
            ? allData.restaurants
            : [];
          setRestaurants(allItems);
          setShowingFallback(true);
        } else {
          setRestaurants(safeItems);
          setShowingFallback(false);
        }
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
        // On error, try to fetch all restaurants as fallback
        try {
          const { data: fallbackData } = await api.get('/restaurants');
          const fallbackItems = Array.isArray(fallbackData?.restaurants)
            ? fallbackData.restaurants
            : [];
          setRestaurants(fallbackItems);
          setShowingFallback(!!hasSearchParams);
        } catch (fallbackError) {
          console.error('Failed to fetch fallback restaurants:', fallbackError);
          setRestaurants([]);
          setShowingFallback(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [area, cuisine, date, time, people, budget, hasSearchParams]);

  // Sort restaurants by rating (highest first) for recommendations
  const sortedRestaurants = [...restaurants].sort(
    (a, b) => b.avg_rating - a.avg_rating
  );

  return (
    <main className='max-w-6xl mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          {hasSearchParams
            ? showingFallback
              ? APP_TEXT.RESTAURANTS.RECOMMENDED
              : APP_TEXT.RESTAURANTS.SEARCH_RESULTS
            : APP_TEXT.RESTAURANTS.RECOMMENDED}
        </h1>
        <p className='text-gray-600'>
          {hasSearchParams
            ? showingFallback
              ? APP_TEXT.RESTAURANTS.NO_MATCH_FOUND +
                ' ' +
                APP_TEXT.RESTAURANTS.SHOWING_RECOMMENDATIONS
              : APP_TEXT.RESTAURANTS.FOUND_COUNT.replace(
                  '{count}',
                  restaurants.length.toString()
                ).replace('{plural}', restaurants.length !== 1 ? 's' : '')
            : APP_TEXT.RESTAURANTS.DISCOVER_DESCRIPTION}
        </p>

        {/* Show search parameters if any */}
        {hasSearchParams && (
          <div className='mt-4 flex flex-wrap gap-2'>
            {area && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                <MapPin className='h-3 w-3' />
                {area}
              </Badge>
            )}
            {cuisine && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                <Utensils className='h-3 w-3' />
                {cuisine}
              </Badge>
            )}
            {budget && budget !== 'all' && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                <DollarSign className='h-3 w-3' />
                {budget}
              </Badge>
            )}
            {people && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {people} {people === '1' ? 'Guest' : 'Guests'}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className='space-y-6'>
        {sortedRestaurants.map((restaurant) => {
          const mainImage =
            restaurant.images?.find((img) => img.IsMain) ||
            restaurant.images?.[0];
          const isOpenNow =
            restaurant.is_open &&
            restaurant.open_hours?.some((hour) => {
              const now = new Date();
              const dayOfWeek = now.getDay();
              const currentTime = now.getHours() * 60 + now.getMinutes();
              const openTime = hour.OpenTime.split(':').map(Number);
              const closeTime = hour.CloseTime.split(':').map(Number);
              const openMinutes = openTime[0] * 60 + openTime[1];
              const closeMinutes = closeTime[0] * 60 + closeTime[1];

              return (
                hour.Weekday === dayOfWeek &&
                !hour.IsClosed &&
                currentTime >= openMinutes &&
                currentTime <= closeMinutes
              );
            });

          return (
            <Card
              key={restaurant.id}
              className='enhanced-card group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-lg'
            >
              <div className='flex flex-col md:flex-row'>
                {/* Image Section */}
                <div className='relative w-full md:w-80 h-48 md:h-64 bg-gradient-to-br from-neutral-100 to-neutral-200 flex-shrink-0'>
                  {mainImage ? (
                    <Image
                      src={mainImage.URL}
                      alt={mainImage.Alt || restaurant.name}
                      fill
                      className='object-cover group-hover:scale-105 transition-transform duration-500'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10'>
                      <Utensils className='h-12 w-12 text-primary/50' />
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className='absolute top-3 left-3 flex flex-wrap gap-2'>
                    <Badge
                      variant={restaurant.is_open ? 'default' : 'destructive'}
                      className='shadow-md'
                    >
                      {isOpenNow
                        ? APP_TEXT.RESTAURANTS.OPEN_NOW
                        : restaurant.is_open
                        ? APP_TEXT.COMMON.OPEN
                        : APP_TEXT.RESTAURANTS.CLOSED_NOW}
                    </Badge>
                    {restaurant.genre && (
                      <Badge
                        variant='secondary'
                        className='bg-white/95 shadow-md'
                      >
                        {restaurant.genre}
                      </Badge>
                    )}
                  </div>

                  {/* Rating Badge */}
                  {restaurant.avg_rating > 0 && (
                    <div className='absolute top-3 right-3 bg-white/95 rounded-full px-3 py-1 flex items-center space-x-1 shadow-md'>
                      <Star className='h-4 w-4 fill-accent text-accent' />
                      <span className='text-sm font-semibold text-neutral-700'>
                        {restaurant.avg_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className='flex-1 p-6'>
                  <div className='flex flex-col h-full'>
                    {/* Header */}
                    <div className='mb-4'>
                      <CardTitle className='text-2xl group-hover:text-primary transition-colors mb-2'>
                        <Link
                          href={`/r/${restaurant.slug}`}
                          className='hover:underline'
                        >
                          {restaurant.name}
                        </Link>
                      </CardTitle>
                      {restaurant.slogan && (
                        <p className='text-lg text-neutral-600 italic mb-3 font-medium'>
                          {restaurant.slogan}
                        </p>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                      <div className='flex items-center space-x-2 text-neutral-600'>
                        <MapPin className='h-5 w-5 text-primary' />
                        <span className='font-medium text-neutral-700'>
                          Location:
                        </span>
                        <span className='text-neutral-600'>
                          {restaurant.place}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2 text-neutral-600'>
                        <DollarSign className='h-5 w-5 text-secondary' />
                        <span className='font-medium text-neutral-700'>
                          Budget:
                        </span>
                        <span className='text-neutral-600'>
                          {restaurant.budget}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2 text-neutral-600'>
                        <Utensils className='h-5 w-5 text-accent' />
                        <span className='font-medium text-neutral-700'>
                          Cuisine:
                        </span>
                        <span className='text-neutral-600'>
                          {restaurant.genre}
                        </span>
                      </div>
                      {restaurant.review_count > 0 && (
                        <div className='flex items-center space-x-2 text-neutral-600'>
                          <Star className='h-5 w-5 fill-accent text-accent' />
                          <span className='font-medium text-neutral-700'>
                            Rating:
                          </span>
                          <span className='text-neutral-600'>
                            {restaurant.avg_rating.toFixed(1)} (
                            {restaurant.review_count}{' '}
                            {restaurant.review_count === 1
                              ? 'review'
                              : 'reviews'}
                            )
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {restaurant.description && (
                      <div className='mb-4'>
                        <p className='text-neutral-600 line-clamp-3 leading-relaxed'>
                          {restaurant.description.replace(/<[^>]*>/g, '')}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className='mt-auto flex items-center justify-between'>
                      <div className='flex gap-2'>
                        <Link href={`/r/${restaurant.slug}`}>
                          <EnhancedButton
                            variant='default'
                            size='sm'
                            leftIcon={<Eye className='h-4 w-4' />}
                          >
                            {APP_TEXT.RESTAURANTS.VIEW_DETAILS}
                          </EnhancedButton>
                        </Link>
                        <Link href={`/r/${restaurant.slug}?action=reserve`}>
                          <EnhancedButton
                            variant='outline'
                            size='sm'
                            leftIcon={<Calendar className='h-4 w-4' />}
                          >
                            {APP_TEXT.RESTAURANTS.MAKE_RESERVATION}
                          </EnhancedButton>
                        </Link>
                      </div>
                      <div className='text-sm text-neutral-500 flex items-center gap-1'>
                        <Users className='h-4 w-4' />
                        {restaurant.capacity} {APP_TEXT.COMMON.PEOPLE}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {isLoading ? (
        <div className='text-center py-12'>
          <div className='w-24 h-24 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center'>
            <Utensils className='h-12 w-12 text-neutral-400 animate-pulse' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Loading restaurants...
          </h3>
          <p className='text-gray-600'>
            Please wait while we fetch the best dining options for you.
          </p>
        </div>
      ) : (
        restaurants.length === 0 &&
        !showingFallback && (
          <div className='text-center py-12'>
            <div className='w-24 h-24 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center'>
              <Utensils className='h-12 w-12 text-neutral-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {APP_TEXT.RESTAURANTS.NO_RESTAURANTS}
            </h3>
            <p className='text-gray-600 mb-4'>
              {APP_TEXT.RESTAURANTS.NO_RESTAURANTS_DESCRIPTION}
            </p>
            <EnhancedButton
              onClick={() => (window.location.href = '/')}
              variant='outline'
              leftIcon={<Search className='h-4 w-4' />}
            >
              Try Different Search
            </EnhancedButton>
          </div>
        )
      )}
    </main>
  );
}
