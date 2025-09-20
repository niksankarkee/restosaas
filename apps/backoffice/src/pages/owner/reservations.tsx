import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@restosaas/ui';
import { Input } from '@restosaas/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import { apiClient } from '../../lib/api-client';
import {
  Search,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import type { Reservation } from '@restosaas/types';

export function OwnerReservations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['owner-reservations'],
    queryFn: () => apiClient.getReservations(),
  });

  const filteredReservations =
    reservations?.filter((reservation) => {
      const matchesSearch =
        reservation.customerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.customerEmail
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.customerPhone
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || reservation.status === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'PENDING':
        return <AlertCircle className='h-4 w-4 text-yellow-500' />;
      case 'CANCELLED':
        return <XCircle className='h-4 w-4 text-red-500' />;
      case 'COMPLETED':
        return <CheckCircle className='h-4 w-4 text-blue-500' />;
      default:
        return <AlertCircle className='h-4 w-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Reservations</h1>
        <p className='text-gray-600'>Manage customer reservations</p>
      </div>

      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            placeholder='Search reservations...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <div className='flex items-center space-x-2'>
          <label className='text-sm font-medium text-gray-700'>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>All</option>
            <option value='PENDING'>Pending</option>
            <option value='CONFIRMED'>Confirmed</option>
            <option value='CANCELLED'>Cancelled</option>
            <option value='COMPLETED'>Completed</option>
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredReservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-lg'>
                    {reservation.customerName}
                  </CardTitle>
                  <p className='text-sm text-gray-500'>
                    {reservation.customerEmail}
                  </p>
                </div>
                <div className='flex items-center space-x-1'>
                  {getStatusIcon(reservation.status)}
                  <span
                    className={`text-sm px-2 py-1 rounded ${getStatusColor(
                      reservation.status
                    )}`}
                  >
                    {reservation.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <Calendar className='h-4 w-4 text-gray-400' />
                  <span className='text-sm text-gray-600'>
                    {new Date(reservation.date).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Clock className='h-4 w-4 text-gray-400' />
                  <span className='text-sm text-gray-600'>
                    {reservation.time}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Users className='h-4 w-4 text-gray-400' />
                  <span className='text-sm text-gray-600'>
                    {reservation.partySize} people
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Phone className='h-4 w-4 text-gray-400' />
                  <span className='text-sm text-gray-600'>
                    {reservation.customerPhone}
                  </span>
                </div>
                {reservation.specialRequests && (
                  <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                    <p className='text-sm text-gray-700'>
                      <strong>Special Requests:</strong>{' '}
                      {reservation.specialRequests}
                    </p>
                  </div>
                )}
                {reservation.courseId && (
                  <div className='mt-3 p-3 bg-blue-50 rounded-md'>
                    <p className='text-sm text-blue-700'>
                      <strong>Course Reservation:</strong> Course ID{' '}
                      {reservation.courseId}
                    </p>
                  </div>
                )}
                <div className='flex space-x-2 mt-4'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      // TODO: Implement reservation actions
                      console.log('Update reservation:', reservation.id);
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      // TODO: Implement reservation actions
                      console.log('View details:', reservation.id);
                    }}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <Card>
          <CardContent className='text-center py-12'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              No reservations found
            </h3>
            <p className='text-gray-600'>
              {searchTerm || statusFilter !== 'all'
                ? 'No reservations match your search criteria.'
                : "You don't have any reservations yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
