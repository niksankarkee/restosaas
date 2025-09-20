'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import { Button } from '@restosaas/ui';
import {
  Clock,
  MapPin,
  DollarSign,
  Star,
  Utensils,
  Camera,
  MessageSquare,
  Navigation,
} from 'lucide-react';
import { ReservationDialog } from './reservation-dialog';
import { ReviewDialog } from './review-dialog';

interface RestaurantDetailsProps {
  slug: string;
}

interface Restaurant {
  ID: string;
  Slug: string;
  Name: string;
  Slogan: string;
  Place: string;
  Genre: string;
  Budget: string;
  Title: string;
  Description: string;
  Address: string;
  Phone: string;
  Timezone: string;
  Capacity: number;
  IsOpen: boolean;
  MainImageID?: string;
  OpenHours: OpeningHour[];
  Menus: Menu[];
  Images: Image[];
  AvgRating: number;
  ReviewCount: number;
  CreatedAt: string;
  UpdatedAt: string;
}

interface OpeningHour {
  ID: string;
  Weekday: number;
  OpenTime: string;
  CloseTime: string;
  IsClosed: boolean;
}

interface Menu {
  ID: string;
  Title: string;
  Description: string;
  Courses: Course[];
}

interface Course {
  ID: string;
  Name: string;
  Price: number;
  ImageURL: string;
}

interface Image {
  ID: string;
  URL: string;
  Alt: string;
  IsMain: boolean;
  DisplayOrder: number;
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

// Helper function to format price range
const formatPriceRange = (restaurant: Restaurant): string => {
  // If budget contains a range format like "500-1500" or "500 ~ 1500"
  if (
    restaurant.Budget &&
    (restaurant.Budget.includes('-') || restaurant.Budget.includes('~'))
  ) {
    return `Rs (${restaurant.Budget})`;
  }
  // If budget is a single value
  if (restaurant.Budget && !restaurant.Budget.includes('$')) {
    return `Rs (${restaurant.Budget})`;
  }
  // Fallback to old budget format if price range not available
  return restaurant.Budget.replace(/\$/g, 'Rs ');
};

export function RestaurantDetails({ slug }: RestaurantDetailsProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, [slug]);

  const fetchRestaurant = async () => {
    try {
      setIsLoading(true);
      const data = await fetch(`/api/restaurants/${slug}`).then((res) =>
        res.json()
      );
      setRestaurant(data);
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
      setRestaurant(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='animate-pulse'>
        <div className='h-12 bg-gray-200 rounded w-1/3 mb-4'></div>
        <div className='h-6 bg-gray-200 rounded w-1/4 mb-6'></div>
        <div className='h-64 bg-gray-200 rounded mb-8'></div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-32 bg-gray-200 rounded'></div>
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <Card>
        <CardContent className='text-center py-12'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Restaurant Not Found
          </h1>
          <p className='text-gray-600'>
            The restaurant you're looking for doesn't exist.
          </p>
        </CardContent>
      </Card>
    );
  }

  const mainImage =
    restaurant.Images?.find((img) => img.IsMain) || restaurant.Images?.[0];

  return (
    <div className='mb-8'>
      {/* Restaurant Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
        <div>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            {restaurant.Name}
          </h1>
          <div className='flex items-center text-gray-600 mb-2'>
            <MapPin className='h-4 w-4 mr-1' />
            <span>{restaurant.Place}</span>
          </div>
          {restaurant.Slogan && (
            <p className='text-lg text-gray-700 italic'>
              "{restaurant.Slogan}"
            </p>
          )}
        </div>
        <div className='flex items-center space-x-2 mt-4 md:mt-0'>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              restaurant.IsOpen
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {restaurant.IsOpen ? 'Open' : 'Closed'}
          </span>
          {restaurant.Genre && (
            <span className='px-2 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700'>
              {restaurant.Genre}
            </span>
          )}
          {restaurant.AvgRating > 0 && (
            <div className='flex items-center space-x-1'>
              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
              <span className='text-sm font-medium'>
                {restaurant.AvgRating.toFixed(1)} ({restaurant.ReviewCount})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Image */}
      {mainImage && (
        <div className='mb-6 relative group'>
          <img
            src={mainImage.URL}
            alt={mainImage.Alt || restaurant.Name}
            className='w-full h-64 md:h-96 object-cover rounded-lg shadow-lg'
          />
        </div>
      )}

      {/* Quick Info Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        {restaurant.Budget && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center'>
                <DollarSign className='h-5 w-5 mr-2' />
                Price Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-green-600'>
                {formatPriceRange(restaurant)}
              </p>
            </CardContent>
          </Card>
        )}

        {restaurant.Genre && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center'>
                <Utensils className='h-5 w-5 mr-2' />
                Cuisine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-lg font-semibold'>{restaurant.Genre}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg flex items-center'>
              <Clock className='h-5 w-5 mr-2' />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span
              className={`text-lg px-3 py-1 rounded-full font-medium ${
                restaurant.IsOpen
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {restaurant.IsOpen ? 'Currently Open' : 'Currently Closed'}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg flex items-center'>
              <Star className='h-5 w-5 mr-2' />
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-1'>
              <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
              <span className='text-2xl font-bold'>
                {restaurant.AvgRating > 0
                  ? restaurant.AvgRating.toFixed(1)
                  : 'N/A'}
              </span>
              <span className='text-sm text-gray-500'>
                ({restaurant.ReviewCount})
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-4 mb-8'>
        <Button
          size='lg'
          className='flex-1'
          onClick={() => setIsReservationOpen(true)}
        >
          Make a Reservation
        </Button>
        <Button
          size='lg'
          variant='outline'
          className='flex-1'
          onClick={() => setIsReviewOpen(true)}
        >
          Write a Review
        </Button>
      </div>

      {/* Reservation Dialog */}
      {restaurant && (
        <ReservationDialog
          isOpen={isReservationOpen}
          onClose={() => setIsReservationOpen(false)}
          restaurantSlug={restaurant.Slug}
          restaurantName={restaurant.Name}
          restaurantCapacity={restaurant.Capacity}
          openHours={restaurant.OpenHours}
        />
      )}

      {/* Review Dialog */}
      {restaurant && (
        <ReviewDialog
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          restaurantSlug={restaurant.Slug}
          restaurantName={restaurant.Name}
          onReviewSubmitted={() => {
            // Refresh restaurant data to get updated reviews
            fetchRestaurant();
          }}
        />
      )}
    </div>
  );
}
