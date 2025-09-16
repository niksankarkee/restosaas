import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, DollarSign, Star, Utensils } from 'lucide-react';

async function getRestaurant(slug: string) {
  try {
    const { data } = await api.get(`/restaurants/${slug}`);
    return data;
  } catch (error) {
    return null;
  }
}

export default async function RestaurantPage({
  params,
}: {
  params: { slug: string };
}) {
  const restaurant = await getRestaurant(params.slug);

  if (!restaurant) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
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
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Restaurant Header */}
      <div className='mb-8'>
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
            <Badge variant={restaurant.IsOpen ? 'default' : 'secondary'}>
              {restaurant.IsOpen ? 'Open' : 'Closed'}
            </Badge>
            {restaurant.Genre && (
              <Badge variant='outline'>{restaurant.Genre}</Badge>
            )}
          </div>
        </div>

        {restaurant.Description && (
          <Card>
            <CardContent className='p-6'>
              <h2 className='text-xl font-semibold mb-3'>About</h2>
              <div
                className='prose prose-gray max-w-none'
                dangerouslySetInnerHTML={{ __html: restaurant.Description }}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Restaurant Details Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        {restaurant.Budget && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center'>
                <DollarSign className='h-5 w-5 mr-2' />
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-green-600'>
                {restaurant.Budget}
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
            <Badge
              variant={restaurant.IsOpen ? 'default' : 'secondary'}
              className='text-lg px-3 py-1'
            >
              {restaurant.IsOpen ? 'Currently Open' : 'Currently Closed'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-4 mb-8'>
        <Button size='lg' className='flex-1'>
          Make a Reservation
        </Button>
        <Button size='lg' variant='outline' className='flex-1'>
          View Menu
        </Button>
        <Button size='lg' variant='outline' className='flex-1'>
          Write a Review
        </Button>
      </div>

      {/* Placeholder sections for future features */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Star className='h-5 w-5 mr-2' />
              Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 text-center py-8'>
              Reviews will be displayed here once customers start leaving them.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 text-center py-8'>
              Online reservation system will be available here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
