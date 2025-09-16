'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationDate: string; // ISO date string
  reservationTime: string; // HH:MM format
  partySize: number;
  specialRequests?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

export default function ReservationManagementPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  >('ALL');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      // This would be replaced with actual API call
      // const response = await api.get('/owner/reservations');
      // setReservations(response.data);

      // Mock data for now
      setReservations([
        {
          id: '1',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+1234567890',
          reservationDate: '2024-01-20',
          reservationTime: '19:00',
          partySize: 4,
          specialRequests: 'Window seat preferred',
          status: 'PENDING',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          customerPhone: '+1234567891',
          reservationDate: '2024-01-21',
          reservationTime: '20:30',
          partySize: 2,
          status: 'CONFIRMED',
          createdAt: '2024-01-14T15:45:00Z',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateReservationStatus = async (
    reservationId: string,
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  ) => {
    try {
      // This would be replaced with actual API call
      // await api.put(`/owner/reservations/${reservationId}/status`, { status });

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status }
            : reservation
        )
      );
    } catch (error) {
      console.error('Failed to update reservation status:', error);
    }
  };

  const filteredReservations =
    filter === 'ALL'
      ? reservations
      : reservations.filter((r) => r.status === filter);

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
            <div className='h-64 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Reservation Management
            </h1>
            <p className='text-gray-600 mt-2'>
              View and manage all incoming reservations
            </p>
          </div>
        </div>

        <div className='mb-6 flex space-x-2 overflow-x-auto'>
          <Button
            variant={filter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilter('ALL')}
          >
            All ({reservations.length})
          </Button>
          <Button
            variant={filter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setFilter('PENDING')}
          >
            Pending ({reservations.filter((r) => r.status === 'PENDING').length}
            )
          </Button>
          <Button
            variant={filter === 'CONFIRMED' ? 'default' : 'outline'}
            onClick={() => setFilter('CONFIRMED')}
          >
            Confirmed (
            {reservations.filter((r) => r.status === 'CONFIRMED').length})
          </Button>
          <Button
            variant={filter === 'CANCELLED' ? 'default' : 'outline'}
            onClick={() => setFilter('CANCELLED')}
          >
            Cancelled (
            {reservations.filter((r) => r.status === 'CANCELLED').length})
          </Button>
          <Button
            variant={filter === 'COMPLETED' ? 'default' : 'outline'}
            onClick={() => setFilter('COMPLETED')}
          >
            Completed (
            {reservations.filter((r) => r.status === 'COMPLETED').length})
          </Button>
        </div>

        {filteredReservations.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No reservations found
              </h3>
              <p className='text-gray-600'>
                {filter === 'ALL'
                  ? 'No reservations have been made yet.'
                  : `No ${filter.toLowerCase()} reservations found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-6'>
            {filteredReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='text-xl'>
                        {reservation.customerName}
                      </CardTitle>
                      <p className='text-gray-600'>
                        {reservation.customerEmail} •{' '}
                        {reservation.customerPhone}
                      </p>
                    </div>
                    <Badge
                      variant={
                        reservation.status === 'CONFIRMED'
                          ? 'default'
                          : reservation.status === 'PENDING'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {reservation.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex justify-end gap-2 mb-4'>
                    {reservation.status === 'PENDING' && (
                      <>
                        <Button
                          size='sm'
                          onClick={() =>
                            updateReservationStatus(reservation.id, 'CONFIRMED')
                          }
                        >
                          Confirm
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            updateReservationStatus(reservation.id, 'CANCELLED')
                          }
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {reservation.status === 'CONFIRMED' && (
                      <Button
                        size='sm'
                        onClick={() =>
                          updateReservationStatus(reservation.id, 'COMPLETED')
                        }
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <h4 className='font-semibold text-gray-900'>
                        Date & Time
                      </h4>
                      <p className='text-gray-600'>
                        {new Date(
                          reservation.reservationDate
                        ).toLocaleDateString()}
                      </p>
                      <p className='text-gray-600'>
                        {reservation.reservationTime}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900'>
                        Party Size
                      </h4>
                      <p className='text-gray-600'>
                        {reservation.partySize} people
                      </p>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900'>Booked On</h4>
                      <p className='text-gray-600'>
                        {new Date(reservation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {reservation.specialRequests && (
                    <div className='mt-4'>
                      <h4 className='font-semibold text-gray-900'>
                        Special Requests
                      </h4>
                      <p className='text-gray-600'>
                        {reservation.specialRequests}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
