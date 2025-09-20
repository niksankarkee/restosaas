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
import { Star, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantSlug: string;
  restaurantName: string;
  onReviewSubmitted?: () => void;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  customerName: string;
  customerEmail: string;
}

export function ReviewDialog({
  isOpen,
  onClose,
  restaurantSlug,
  restaurantName,
  onReviewSubmitted,
}: ReviewDialogProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    title: '',
    comment: '',
    customerName: '',
    customerEmail: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRatingChange = (rating: number) => {
    setFormData({
      ...formData,
      rating,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post(`/restaurants/${restaurantSlug}/reviews`, {
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          rating: 5,
          title: '',
          comment: '',
          customerName: '',
          customerEmail: '',
        });
        onReviewSubmitted?.();
      }, 2000);
    } catch (err: unknown) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className='flex space-x-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type='button'
            onClick={() => handleRatingChange(star)}
            className={`p-1 ${
              star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <Star className='w-6 h-6 fill-current' />
          </button>
        ))}
      </div>
    );
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-center text-green-600'>
              Review Submitted!
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
              Thank you for your review of {restaurantName}!
            </p>
            <p className='text-sm text-gray-500 mt-2'>
              Your review will be published after moderation.
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
          <DialogTitle>Write a Review for {restaurantName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Rating *
            </label>
            <div className='flex items-center space-x-2'>
              {renderStars()}
              <span className='text-sm text-gray-500 ml-2'>
                {formData.rating} out of 5 stars
              </span>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Review Title *
            </label>
            <Input
              type='text'
              name='title'
              value={formData.title}
              onChange={handleChange}
              placeholder='Summarize your experience'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <MessageSquare className='w-4 h-4 inline mr-1' />
              Your Review *
            </label>
            <textarea
              name='comment'
              value={formData.comment}
              onChange={handleChange}
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Tell others about your dining experience...'
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Your Name *
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
                Your Email *
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

          {error && <div className='text-red-600 text-sm'>{error}</div>}

          <div className='flex justify-end space-x-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Submitting Review...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
