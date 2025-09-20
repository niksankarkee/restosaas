import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import { useQuery } from '@tanstack/react-query';
import { api as apiClient } from '../../lib/api-client';

export function OwnerDashboard() {
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['owner-restaurants'],
    queryFn: () => apiClient.getMyRestaurants(),
  });

  const { data: reservations, isLoading: reservationsLoading } = useQuery({
    queryKey: ['owner-reservations'],
    queryFn: () => apiClient.getReservations(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
        <p className='text-gray-600'>
          Welcome to your restaurant management dashboard
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{restaurants?.length || 0}</div>
            <p className='text-xs text-muted-foreground'>Total restaurants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {reservations?.length || 0}
            </div>
            <p className='text-xs text-muted-foreground'>Total reservations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Today's Reservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {reservations?.filter((r) => {
                const today = new Date().toDateString();
                return new Date(r.date).toDateString() === today;
              }).length || 0}
            </div>
            <p className='text-xs text-muted-foreground'>Reservations today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>Reviews to approve</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            {reservationsLoading ? (
              <div>Loading reservations...</div>
            ) : reservations && reservations.length > 0 ? (
              <div className='space-y-2'>
                {reservations.slice(0, 5).map((reservation) => (
                  <div
                    key={reservation.id}
                    className='flex justify-between items-center p-2 border rounded'
                  >
                    <div>
                      <p className='font-medium'>{reservation.customerName}</p>
                      <p className='text-sm text-gray-500'>
                        {reservation.date} at {reservation.time}
                      </p>
                    </div>
                    <span className='text-sm text-gray-500'>
                      {reservation.partySize} people
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500'>No reservations yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restaurant Status</CardTitle>
          </CardHeader>
          <CardContent>
            {restaurants && restaurants.length > 0 ? (
              <div className='space-y-2'>
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className='flex justify-between items-center p-2 border rounded'
                  >
                    <div>
                      <p className='font-medium'>{restaurant.name}</p>
                      <p className='text-sm text-gray-500'>
                        {restaurant.place}
                      </p>
                    </div>
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
                ))}
              </div>
            ) : (
              <p className='text-gray-500'>No restaurants yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
