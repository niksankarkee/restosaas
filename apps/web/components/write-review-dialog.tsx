'use client';

import { useState } from 'react';
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
import { Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

interface WriteReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantSlug: string;
  onReviewSubmitted?: () => void;
}

export function WriteReviewDialog({
  isOpen,
  onClose,
  restaurantSlug,
  onReviewSubmitted,
}: WriteReviewDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    customerName: '',
    title: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError('Please log in to write a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!formData.customerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a review title');
      return;
    }

    if (!formData.comment.trim()) {
      setError('Please enter a review comment');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await api.post('/reviews', {
        restaurantSlug,
        customerName: formData.customerName.trim(),
        rating,
        title: formData.title.trim(),
        comment: formData.comment.trim(),
      });

      // Reset form
      setRating(0);
      setFormData({ customerName: '', title: '', comment: '' });
      onReviewSubmitted?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      setError(
        error.response?.data?.error ||
          'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setFormData({ customerName: '', title: '', comment: '' });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className='text-center py-6'>
            <p className='text-gray-600 mb-4'>
              Please log in to write a review
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
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
                maxLength={100}
              />
            </div>

            {/* Rating */}
            <div>
              <Label>Rating *</Label>
              <div className='flex items-center space-x-1 mt-2'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type='button'
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className='focus:outline-none'
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className='ml-2 text-sm text-gray-600'>
                  {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor='title'>Review Title *</Label>
              <Input
                id='title'
                type='text'
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder='Summarize your experience'
                required
                maxLength={100}
              />
            </div>

            {/* Comment */}
            <div>
              <Label htmlFor='comment'>Your Review *</Label>
              <Textarea
                id='comment'
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                placeholder='Tell others about your experience...'
                rows={4}
                required
                maxLength={500}
              />
              <p className='text-xs text-gray-500 mt-1'>
                {formData.comment.length}/500 characters
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
              <Button type='submit' disabled={isSubmitting || rating === 0}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
