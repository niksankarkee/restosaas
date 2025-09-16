import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, DollarSign, Clock, Utensils } from 'lucide-react';

interface Restaurant {
  ID: string;
  Slug: string;
  Name: string;
  Slogan: string;
  Place: string;
  Genre: string;
  Budget: string;
  Description?: string;
  IsOpen: boolean;
  MainImageID?: string;
  Images?: Array<{
    ID: string;
    URL: string;
    Alt: string;
    IsMain: boolean;
  }>;
  AvgRating: number;
  ReviewCount: number;
  OpenHours?: Array<{
    Weekday: number;
    OpenTime: string;
    CloseTime: string;
    IsClosed: boolean;
  }>;
}

async function getRestaurants(searchParams: {
  area?: string;
  cuisine?: string;
  date?: string;
  time?: string;
  people?: string;
  budget?: string;
}) {
  const params: any = {};

  if (searchParams.area) params.area = searchParams.area;
  if (searchParams.cuisine) params.cuisine = searchParams.cuisine;
  if (searchParams.date) params.date = searchParams.date;
  if (searchParams.time) params.time = searchParams.time;
  if (searchParams.people) params.people = searchParams.people;
  if (searchParams.budget) params.budget = searchParams.budget;

  const { data } = await api.get('/restaurants', { params });
  return data as Restaurant[];
}

export default async function Restaurants({
  searchParams,
}: {
  searchParams: {
    area?: string;
    cuisine?: string;
    date?: string;
    time?: string;
    people?: string;
    budget?: string;
  };
}) {
  const items = await getRestaurants(searchParams);

  // Sort restaurants by rating (highest first) for recommendations
  const sortedRestaurants = [...items].sort(
    (a, b) => b.AvgRating - a.AvgRating
  );

  const hasSearchParams = Object.values(searchParams).some((value) => value);

  return (
    <main className='max-w-6xl mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          {hasSearchParams ? 'Search Results' : 'Recommended Restaurants'}
        </h1>
        <p className='text-gray-600'>
          {hasSearchParams
            ? `Found ${items.length} restaurant${
                items.length !== 1 ? 's' : ''
              } matching your search`
            : 'Discover amazing restaurants recommended for you'}
        </p>

        {/* Show search parameters if any */}
        {hasSearchParams && (
          <div className='mt-4 flex flex-wrap gap-2'>
            {searchParams.area && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                <MapPin className='h-3 w-3' />
                {searchParams.area}
              </Badge>
            )}
            {searchParams.cuisine && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                <Utensils className='h-3 w-3' />
                {searchParams.cuisine}
              </Badge>
            )}
            {searchParams.budget && searchParams.budget !== 'all' && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                <DollarSign className='h-3 w-3' />
                {searchParams.budget}
              </Badge>
            )}
            {searchParams.people && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {searchParams.people}{' '}
                {searchParams.people === '1' ? 'Guest' : 'Guests'}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className='space-y-6'>
        {sortedRestaurants.map((restaurant) => {
          const mainImage =
            restaurant.Images?.find((img) => img.IsMain) ||
            restaurant.Images?.[0];
          const isOpenNow =
            restaurant.IsOpen &&
            restaurant.OpenHours?.some((hour) => {
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
              key={restaurant.ID}
              className='group hover:shadow-lg transition-shadow overflow-hidden'
            >
              <div className='flex flex-col md:flex-row'>
                {/* Image Section */}
                <div className='relative w-full md:w-80 h-48 md:h-64 bg-gray-200 flex-shrink-0'>
                  {mainImage ? (
                    <Image
                      src={mainImage.URL}
                      alt={mainImage.Alt || restaurant.Name}
                      fill
                      className='object-cover group-hover:scale-105 transition-transform duration-300'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-gray-100'>
                      <span className='text-gray-400 text-sm'>No Image</span>
                    </div>
                  )}
                  <div className='absolute top-3 left-3 flex flex-wrap gap-1'>
                    <Badge
                      variant={restaurant.IsOpen ? 'default' : 'secondary'}
                    >
                      {isOpenNow
                        ? 'Open Now'
                        : restaurant.IsOpen
                        ? 'Open'
                        : 'Closed'}
                    </Badge>
                    {restaurant.Genre && (
                      <Badge variant='outline' className='bg-white/90'>
                        {restaurant.Genre}
                      </Badge>
                    )}
                  </div>
                  {restaurant.AvgRating > 0 && (
                    <div className='absolute top-3 right-3 bg-white/90 rounded-full px-2 py-1 flex items-center space-x-1'>
                      <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                      <span className='text-xs font-medium'>
                        {restaurant.AvgRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className='flex-1 p-6'>
                  <div className='flex flex-col h-full'>
                    {/* Header */}
                    <div className='mb-4'>
                      <CardTitle className='text-2xl group-hover:text-blue-600 transition-colors mb-2'>
                        <Link href={`/r/${restaurant.Slug}`}>
                          {restaurant.Name}
                        </Link>
                      </CardTitle>
                      {restaurant.Slogan && (
                        <p className='text-lg text-gray-600 italic mb-3'>
                          {restaurant.Slogan}
                        </p>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                      <div className='flex items-center space-x-2 text-gray-600'>
                        <MapPin className='h-5 w-5' />
                        <span className='font-medium'>Location:</span>
                        <span>{restaurant.Place}</span>
                      </div>
                      <div className='flex items-center space-x-2 text-gray-600'>
                        <DollarSign className='h-5 w-5' />
                        <span className='font-medium'>Budget:</span>
                        <span>{restaurant.Budget}</span>
                      </div>
                      <div className='flex items-center space-x-2 text-gray-600'>
                        <Utensils className='h-5 w-5' />
                        <span className='font-medium'>Cuisine:</span>
                        <span>{restaurant.Genre}</span>
                      </div>
                      {restaurant.ReviewCount > 0 && (
                        <div className='flex items-center space-x-2 text-gray-600'>
                          <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                          <span className='font-medium'>Rating:</span>
                          <span>
                            {restaurant.AvgRating.toFixed(1)} (
                            {restaurant.ReviewCount}{' '}
                            {restaurant.ReviewCount === 1
                              ? 'review'
                              : 'reviews'}
                            )
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {restaurant.Description && (
                      <div className='mb-4'>
                        <p className='text-gray-600 line-clamp-3'>
                          {restaurant.Description.replace(/<[^>]*>/g, '')}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className='mt-auto flex items-center justify-between'>
                      <Link
                        href={`/r/${restaurant.Slug}`}
                        className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                      >
                        View Details
                        <Clock className='h-4 w-4 ml-2' />
                      </Link>
                      <div className='text-sm text-gray-500'>
                        Capacity: {restaurant.Capacity} people
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className='text-center py-12'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            No restaurants found
          </h3>
          <p className='text-gray-600'>
            Try adjusting your search criteria or check back later.
          </p>
        </div>
      )}
    </main>
  );
}
