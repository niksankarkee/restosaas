'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function ReviewManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  >('ALL');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      // This would be replaced with actual API call
      // const response = await api.get('/owner/reviews');
      // setReviews(response.data);

      // Mock data for now
      setReviews([
        {
          id: '1',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          rating: 5,
          comment: 'Excellent food and service!',
          status: 'PENDING',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          rating: 4,
          comment: 'Good food, friendly staff.',
          status: 'APPROVED',
          createdAt: '2024-01-14T15:45:00Z',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateReviewStatus = async (
    reviewId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    try {
      // This would be replaced with actual API call
      // await api.put(`/owner/reviews/${reviewId}/status`, { status });

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, status } : review
        )
      );
    } catch (error) {
      console.error('Failed to update review status:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const filteredReviews =
    filter === 'ALL' ? reviews : reviews.filter((r) => r.status === filter);

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
            <h1 className='text-3xl font-bold text-gray-900'>Reviews</h1>
            <p className='text-gray-600 mt-2'>
              Manage customer reviews and ratings
            </p>
          </div>
        </div>

        <div className='mb-6 grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card className='p-4 text-center'>
            <div className='text-2xl font-bold text-gray-900'>
              {reviews.length}
            </div>
            <div className='text-sm text-gray-600'>Total Reviews</div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-2xl font-bold text-yellow-600'>
              {reviews.filter((r) => r.status === 'PENDING').length}
            </div>
            <div className='text-sm text-gray-600'>Pending</div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {reviews.filter((r) => r.status === 'APPROVED').length}
            </div>
            <div className='text-sm text-gray-600'>Approved</div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-2xl font-bold text-red-600'>
              {reviews.filter((r) => r.status === 'REJECTED').length}
            </div>
            <div className='text-sm text-gray-600'>Rejected</div>
          </Card>
        </div>

        <div className='mb-6 flex space-x-2 overflow-x-auto'>
          <Button
            variant={filter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilter('ALL')}
          >
            All ({reviews.length})
          </Button>
          <Button
            variant={filter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setFilter('PENDING')}
          >
            Pending ({reviews.filter((r) => r.status === 'PENDING').length})
          </Button>
          <Button
            variant={filter === 'APPROVED' ? 'default' : 'outline'}
            onClick={() => setFilter('APPROVED')}
          >
            Approved ({reviews.filter((r) => r.status === 'APPROVED').length})
          </Button>
          <Button
            variant={filter === 'REJECTED' ? 'default' : 'outline'}
            onClick={() => setFilter('REJECTED')}
          >
            Rejected ({reviews.filter((r) => r.status === 'REJECTED').length})
          </Button>
        </div>

        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No reviews found
              </h3>
              <p className='text-gray-600'>
                {filter === 'ALL'
                  ? 'No reviews have been submitted yet.'
                  : `No ${filter.toLowerCase()} reviews found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-6'>
            {filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='text-xl'>
                        {review.customerName}
                      </CardTitle>
                      <p className='text-gray-600'>{review.customerEmail}</p>
                    </div>
                    <Badge
                      variant={
                        review.status === 'APPROVED'
                          ? 'default'
                          : review.status === 'PENDING'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {review.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex justify-end gap-2 mb-4'>
                    {review.status === 'PENDING' && (
                      <>
                        <Button
                          size='sm'
                          onClick={() =>
                            updateReviewStatus(review.id, 'APPROVED')
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            updateReviewStatus(review.id, 'REJECTED')
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>

                  <div className='flex items-center mb-3'>
                    <div className='flex items-center mr-2'>
                      {renderStars(review.rating)}
                    </div>
                    <span className='text-sm text-gray-600'>
                      {review.rating}/5 stars
                    </span>
                  </div>

                  <p className='text-gray-700 mb-4'>{review.comment}</p>

                  <div className='text-sm text-gray-500'>
                    Submitted on{' '}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
