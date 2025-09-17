'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  availableSeats: number;
}

interface OpeningHour {
  ID: string;
  Weekday: number;
  OpenTime: string;
  CloseTime: string;
  IsClosed: boolean;
}

interface EnhancedReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantSlug: string;
  restaurantName?: string;
  restaurantCapacity?: number;
  openHours?: OpeningHour[];
  courseId?: string; // Optional course ID for course-specific reservations
  onReservationSubmitted?: () => void;
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

export function EnhancedReservationDialog({
  isOpen,
  onClose,
  restaurantSlug,
  restaurantName,
  restaurantCapacity = 30,
  openHours = [],
  courseId,
  onReservationSubmitted,
}: EnhancedReservationDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    specialRequests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Generate available dates (next 30 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Check if restaurant is open on a specific date
  const isRestaurantOpen = (date: string) => {
    const dayOfWeek = new Date(date).getDay();
    const dayHours = openHours.find((hour) => hour.Weekday === dayOfWeek);
    return dayHours && !dayHours.IsClosed;
  };

  // Generate time slots based on restaurant hours
  const generateTimeSlots = (date: string) => {
    const dayOfWeek = new Date(date).getDay();
    const dayHours = openHours.find((hour) => hour.Weekday === dayOfWeek);

    if (!dayHours || dayHours.IsClosed) {
      return [];
    }

    const slots = [];
    const openTime = dayHours.OpenTime;
    const closeTime = dayHours.CloseTime;

    // Parse times (assuming HH:MM format)
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    // Generate 30-minute slots
    for (let minutes = openMinutes; minutes < closeMinutes; minutes += 30) {
      const hour = Math.floor(minutes / 60);
      const min = minutes % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${min
        .toString()
        .padStart(2, '0')}`;

      slots.push({
        id: `${date}-${timeString}`,
        time: timeString,
        available: true, // This would be calculated based on existing reservations
        availableSeats: restaurantCapacity, // This would be calculated based on existing reservations
      });
    }

    return slots;
  };

  useEffect(() => {
    if (isOpen && selectedDate && isRestaurantOpen(selectedDate)) {
      fetchTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [isOpen, selectedDate, restaurantSlug]);

  const fetchTimeSlots = async () => {
    try {
      setIsLoadingSlots(true);
      const response = await api.get(
        `/restaurants/${restaurantSlug}/slots?date=${selectedDate}`
      );
      setTimeSlots(response.data || []);
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
      // Fallback to generated slots
      setTimeSlots(generateTimeSlots(selectedDate));
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError('Please log in to make a reservation');
      return;
    }

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    if (!selectedTime) {
      setError('Please select a time');
      return;
    }

    if (partySize < 1 || partySize > restaurantCapacity) {
      setError(`Party size must be between 1 and ${restaurantCapacity}`);
      return;
    }

    if (!formData.customerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.customerEmail.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!formData.customerPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await api.post('/reservations', {
        restaurantSlug,
        startsAt: `${selectedDate}T${selectedTime}:00.000Z`,
        duration: 90, // 90 minutes default
        party: partySize,
        courseId: courseId || undefined, // Include course ID if provided
        customer: {
          name: formData.customerName.trim(),
          email: formData.customerEmail.trim(),
          phone: formData.customerPhone.trim(),
        },
        specialRequests: formData.specialRequests.trim() || undefined,
      });

      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setPartySize(2);
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        specialRequests: '',
      });
      onReservationSubmitted?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to make reservation:', error);
      setError(
        error.response?.data?.error ||
          'Failed to make reservation. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedDate('');
      setSelectedTime('');
      setPartySize(2);
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        specialRequests: '',
      });
      setError(null);
      onClose();
    }
  };

  const availableDates = getAvailableDates();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <Calendar className='h-5 w-5' />
            <span>Make a Reservation</span>
            {restaurantName && (
              <span className='text-sm text-gray-500'>at {restaurantName}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className='text-center py-6'>
            <p className='text-gray-600 mb-4'>
              Please log in to make a reservation
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Left Column - Date and Time Selection */}
              <div className='space-y-6'>
                {/* Date Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center space-x-2'>
                      <CalendarDays className='h-4 w-4' />
                      <span>Select Date</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Date Picker Input */}
                    <div className='mb-4'>
                      <Label htmlFor='date-picker'>Choose a date</Label>
                      <Input
                        id='date-picker'
                        type='date'
                        value={selectedDate}
                        onChange={(e) => {
                          const date = e.target.value;
                          if (date && isRestaurantOpen(date)) {
                            setSelectedDate(date);
                          }
                        }}
                        min={today}
                        max={availableDates[availableDates.length - 1]}
                        className='mt-1'
                      />
                    </div>

                    {/* Quick Date Selection */}
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>
                        Quick Select
                      </Label>
                      <div className='grid grid-cols-7 gap-1'>
                        {availableDates.slice(0, 14).map((date) => {
                          const isOpen = isRestaurantOpen(date);
                          const isSelected = selectedDate === date;
                          const dayOfWeek = new Date(date).getDay();
                          const dayName = WEEKDAYS[dayOfWeek].slice(0, 3);
                          const dayNumber = new Date(date).getDate();

                          return (
                            <button
                              key={date}
                              type='button'
                              onClick={() => isOpen && setSelectedDate(date)}
                              disabled={!isOpen}
                              className={`p-2 text-center rounded-lg border transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : isOpen
                                  ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              }`}
                            >
                              <div className='text-xs font-medium'>
                                {dayName}
                              </div>
                              <div className='text-sm font-bold'>
                                {dayNumber}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedDate && (
                      <div
                        className={`mt-4 p-3 rounded-lg ${
                          isRestaurantOpen(selectedDate)
                            ? 'bg-blue-50'
                            : 'bg-red-50'
                        }`}
                      >
                        <p
                          className={`text-sm ${
                            isRestaurantOpen(selectedDate)
                              ? 'text-blue-800'
                              : 'text-red-800'
                          }`}
                        >
                          {isRestaurantOpen(selectedDate)
                            ? 'Selected:'
                            : 'Warning:'}{' '}
                          {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          {!isRestaurantOpen(selectedDate) &&
                            ' - Restaurant is closed on this day'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Time Selection */}
                {selectedDate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center space-x-2'>
                        <Clock className='h-4 w-4' />
                        <span>Select Time</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingSlots ? (
                        <div className='text-center py-4'>
                          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto'></div>
                          <p className='text-sm text-gray-500 mt-2'>
                            Loading available times...
                          </p>
                        </div>
                      ) : timeSlots.length === 0 ? (
                        <p className='text-gray-500 text-center py-4'>
                          No available time slots for this date
                        </p>
                      ) : (
                        <div className='grid grid-cols-3 gap-2'>
                          {timeSlots.map((slot) => (
                            <button
                              key={slot.id}
                              type='button'
                              onClick={() => setSelectedTime(slot.time)}
                              disabled={
                                !slot.available ||
                                slot.availableSeats < partySize
                              }
                              className={`p-3 text-center rounded-lg border transition-colors ${
                                selectedTime === slot.time
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : slot.available &&
                                    slot.availableSeats >= partySize
                                  ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              }`}
                            >
                              <div className='font-medium'>{slot.time}</div>
                              <div className='text-xs'>
                                {slot.availableSeats} seats
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Party Size */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center space-x-2'>
                      <Users className='h-4 w-4' />
                      <span>Party Size</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={partySize.toString()}
                      onValueChange={(value) => setPartySize(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: Math.min(restaurantCapacity, 20) },
                          (_, i) => i + 1
                        ).map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size} {size === 1 ? 'person' : 'people'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className='text-xs text-gray-500 mt-2'>
                      Maximum capacity: {restaurantCapacity} people
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Customer Information */}
              <div className='space-y-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center space-x-2'>
                      <Mail className='h-4 w-4' />
                      <span>Contact Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <Label htmlFor='customerName'>Your Name *</Label>
                      <Input
                        id='customerName'
                        type='text'
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerName: e.target.value,
                          })
                        }
                        placeholder='Enter your full name'
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor='customerEmail'>Email *</Label>
                      <Input
                        id='customerEmail'
                        type='email'
                        value={formData.customerEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerEmail: e.target.value,
                          })
                        }
                        placeholder='Enter your email'
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor='customerPhone'>Phone Number *</Label>
                      <Input
                        id='customerPhone'
                        type='tel'
                        value={formData.customerPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerPhone: e.target.value,
                          })
                        }
                        placeholder='Enter your phone number'
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Special Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.specialRequests}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialRequests: e.target.value,
                        })
                      }
                      placeholder='Any special dietary requirements or requests...'
                      rows={4}
                      maxLength={500}
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      {formData.specialRequests.length}/500 characters
                    </p>
                  </CardContent>
                </Card>

                {/* Reservation Summary */}
                {selectedDate && selectedTime && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Reservation Summary</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Date:</span>
                        <span className='font-medium'>
                          {new Date(selectedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Time:</span>
                        <span className='font-medium'>{selectedTime}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Party Size:</span>
                        <span className='font-medium'>{partySize} people</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Duration:</span>
                        <span className='font-medium'>90 minutes</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='text-red-600 text-sm bg-red-50 p-3 rounded'>
                {error}
              </div>
            )}

            {/* Actions */}
            <div className='flex justify-end space-x-2 pt-4 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={
                  isSubmitting ||
                  !selectedDate ||
                  !selectedTime ||
                  !formData.customerName ||
                  !formData.customerEmail ||
                  !formData.customerPhone
                }
              >
                {isSubmitting ? 'Making Reservation...' : 'Confirm Reservation'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
