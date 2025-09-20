'use client';

import { useState } from 'react';
import { Button } from '@restosaas/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@restosaas/ui';
import { Input } from '@restosaas/ui';
import { Calendar, Clock, Users, X } from 'lucide-react';
import { api } from '@/lib/api';

interface ReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantSlug: string;
  restaurantName: string;
  restaurantCapacity: number;
  openHours?: OpeningHour[];
}

interface OpeningHour {
  ID: string;
  Weekday: number;
  OpenTime: string;
  CloseTime: string;
  IsClosed: boolean;
}

interface ReservationFormData {
  date: string;
  time: string;
  partySize: number;
  specialRequests: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
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

export function ReservationDialog({
  isOpen,
  onClose,
  restaurantSlug,
  restaurantName,
  restaurantCapacity,
  openHours = [],
}: ReservationDialogProps) {
  const [formData, setFormData] = useState<ReservationFormData>({
    date: '',
    time: '',
    partySize: 2,
    specialRequests: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post(`/restaurants/${restaurantSlug}/reservations`, {
        date: formData.date,
        time: formData.time,
        partySize: formData.partySize,
        specialRequests: formData.specialRequests,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          date: '',
          time: '',
          partySize: 2,
          specialRequests: '',
          customerName: '',
          customerEmail: '',
          customerPhone: '',
        });
      }, 2000);
    } catch (err: unknown) {
      setError(err.response?.data?.error || 'Failed to make reservation');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableTimes = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const getPartySizeOptions = () => {
    const options = [];
    for (let i = 1; i <= Math.min(restaurantCapacity, 20); i++) {
      options.push(i);
    }
    return options;
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-center text-green-600'>
              Reservation Confirmed!
            </DialogTitle>
          </DialogHeader>
          <CardContent className='text-center py-6'>
            <div className='text-green-600 mb-4'>
              <svg
                className='w-16 h-16 mx-auto'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <p className='text-gray-600'>
              Your reservation at {restaurantName} has been confirmed.
            </p>
            <p className='text-sm text-gray-500 mt-2'>
              You will receive a confirmation email shortly.
            </p>
          </CardContent>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Make a Reservation at {restaurantName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                <Calendar className='w-4 h-4 inline mr-1' />
                Date *
              </label>
              <Input
                type='date'
                name='date'
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                <Clock className='w-4 h-4 inline mr-1' />
                Time *
              </label>
              <select
                name='time'
                value={formData.time}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              >
                <option value=''>Select time</option>
                {getAvailableTimes().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <Users className='w-4 h-4 inline mr-1' />
              Party Size *
            </label>
            <select
              name='partySize'
              value={formData.partySize}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            >
              {getPartySizeOptions().map((size) => (
                <option key={size} value={size}>
                  {size} {size === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Full Name *
              </label>
              <Input
                type='text'
                name='customerName'
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email *
              </label>
              <Input
                type='email'
                name='customerEmail'
                value={formData.customerEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Phone Number *
            </label>
            <Input
              type='tel'
              name='customerPhone'
              value={formData.customerPhone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Special Requests
            </label>
            <textarea
              name='specialRequests'
              value={formData.specialRequests}
              onChange={handleChange}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Any special dietary requirements, seating preferences, or other requests...'
            />
          </div>

          {error && <div className='text-red-600 text-sm'>{error}</div>}

          <div className='flex justify-end space-x-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Making Reservation...' : 'Make Reservation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
