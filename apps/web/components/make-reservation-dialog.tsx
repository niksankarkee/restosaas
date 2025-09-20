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
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface MakeReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantSlug: string;
  onReservationSubmitted?: () => void;
}

export function MakeReservationDialog({
  isOpen,
  onClose,
  restaurantSlug,
  onReservationSubmitted,
}: MakeReservationDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    timeSlotId: '',
    partySize: 2,
    specialRequests: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && restaurantSlug && formData.date) {
      fetchTimeSlots();
    }
  }, [isOpen, restaurantSlug, formData.date]);

  const fetchTimeSlots = async () => {
    try {
      setIsLoadingSlots(true);
      const response = await api.get(
        `/restaurants/${restaurantSlug}/slots?date=${formData.date}`
      );
      setTimeSlots(response.data || []);
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
      setTimeSlots([]);
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

    if (!formData.date) {
      setError('Please select a date');
      return;
    }

    if (!formData.timeSlotId) {
      setError('Please select a time slot');
      return;
    }

    if (formData.partySize < 1 || formData.partySize > 20) {
      setError('Party size must be between 1 and 20');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await api.post('/reservations', {
        restaurantSlug,
        date: formData.date,
        timeSlotId: formData.timeSlotId,
        partySize: formData.partySize,
        specialRequests: formData.specialRequests.trim() || undefined,
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim(),
      });

      // Reset form
      setFormData({
        date: '',
        timeSlotId: '',
        partySize: 2,
        specialRequests: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
      });
      onReservationSubmitted?.();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to make reservation:', error);
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error || 'Failed to make reservation. Please try again.'
          : 'Failed to make reservation. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        date: '',
        timeSlotId: '',
        partySize: 2,
        specialRequests: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
      });
      setError(null);
      onClose();
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Make a Reservation</DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className='text-center py-6'>
            <p className='text-gray-600 mb-4'>
              Please log in to make a reservation
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Date */}
            <div>
              <Label htmlFor='date'>Date *</Label>
              <Input
                id='date'
                type='date'
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                min={today}
                required
              />
            </div>

            {/* Time Slot */}
            <div>
              <Label>Time *</Label>
              <Select
                value={formData.timeSlotId}
                onValueChange={(value) =>
                  setFormData({ ...formData, timeSlotId: value })
                }
                disabled={!formData.date || isLoadingSlots}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingSlots ? 'Loading...' : 'Select a time'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem
                      key={slot.id}
                      value={slot.id}
                      disabled={!slot.available}
                    >
                      {slot.time} {!slot.available && '(Unavailable)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {timeSlots.length === 0 && formData.date && !isLoadingSlots && (
                <p className='text-sm text-gray-500 mt-1'>
                  No available time slots for this date
                </p>
              )}
            </div>

            {/* Party Size */}
            <div>
              <Label htmlFor='partySize'>Party Size *</Label>
              <Input
                id='partySize'
                type='number'
                min='1'
                max='20'
                value={formData.partySize}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    partySize: parseInt(e.target.value) || 1,
                  })
                }
                required
              />
            </div>

            {/* Customer Name */}
            <div>
              <Label htmlFor='customerName'>Your Name *</Label>
              <Input
                id='customerName'
                type='text'
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                placeholder='Enter your full name'
                required
              />
            </div>

            {/* Customer Email */}
            <div>
              <Label htmlFor='customerEmail'>Email *</Label>
              <Input
                id='customerEmail'
                type='email'
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                placeholder='Enter your email'
                required
              />
            </div>

            {/* Customer Phone */}
            <div>
              <Label htmlFor='customerPhone'>Phone Number *</Label>
              <Input
                id='customerPhone'
                type='tel'
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                placeholder='Enter your phone number'
                required
              />
            </div>

            {/* Special Requests */}
            <div>
              <Label htmlFor='specialRequests'>
                Special Requests (Optional)
              </Label>
              <Textarea
                id='specialRequests'
                value={formData.specialRequests}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequests: e.target.value })
                }
                placeholder='Any special dietary requirements or requests...'
                rows={3}
                maxLength={500}
              />
              <p className='text-xs text-gray-500 mt-1'>
                {formData.specialRequests.length}/500 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className='text-red-600 text-sm bg-red-50 p-3 rounded'>
                {error}
              </div>
            )}

            {/* Actions */}
            <div className='flex justify-end space-x-2 pt-4'>
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
                  isSubmitting || !formData.date || !formData.timeSlotId
                }
              >
                {isSubmitting ? 'Making Reservation...' : 'Make Reservation'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
