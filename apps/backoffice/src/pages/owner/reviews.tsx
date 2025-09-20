import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@restosaas/ui';
import { Input } from '@restosaas/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import { apiClient } from '../../lib/api-client';
import { Search, Star, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import type { Review } from '@restosaas/types';

export function OwnerReviews() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['owner-reviews'],
    queryFn: () => apiClient.getReservations(), // TODO: Implement getReviews API
  });

  // Mock data for now - replace with actual API call
  const mockReviews: Review[] = [
    {
      id: '1',
      restaurantId: '1',
      customerName: 'John Doe',
      rating: 5,
      comment: 'Excellent food and service! Highly recommended.',
      isApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      restaurantId: '1',
      customerName: 'Jane Smith',
      rating: 4,
      comment: 'Good food, friendly staff. Will come back again.',
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const filteredReviews = mockReviews.filter((review) => {
    const matchesSearch =
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && review.isApproved) ||
      (statusFilter === 'pending' && !review.isApproved);

    return matchesSearch && matchesStatus;
  });

  const approveReviewMutation = useMutation({
    mutationFn: (reviewId: string) => apiClient.approveReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-reviews'] });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getStatusIcon = (isApproved: boolean) => {
    return isApproved ? (
      <CheckCircle className='h-4 w-4 text-green-500' />
    ) : (
      <Clock className='h-4 w-4 text-yellow-500' />
    );
  };

  const getStatusColor = (isApproved: boolean) => {
    return isApproved
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Reviews</h1>
        <p className='text-gray-600'>Manage customer reviews and ratings</p>
      </div>

      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            placeholder='Search reviews...'
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
            <option value='pending'>Pending</option>
            <option value='approved'>Approved</option>
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-lg flex items-center space-x-2'>
                    <User className='h-5 w-5 text-gray-400' />
                    <span>{review.customerName}</span>
                  </CardTitle>
                  <div className='flex items-center space-x-1 mt-1'>
                    {renderStars(review.rating)}
                    <span className='text-sm text-gray-500 ml-1'>
                      ({review.rating}/5)
                    </span>
                  </div>
                </div>
                <div className='flex items-center space-x-1'>
                  {getStatusIcon(review.isApproved)}
                  <span
                    className={`text-sm px-2 py-1 rounded ${getStatusColor(
                      review.isApproved
                    )}`}
                  >
                    {review.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div>
                  <p className='text-sm text-gray-700'>{review.comment}</p>
                </div>
                <div className='text-xs text-gray-500'>
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
                <div className='flex space-x-2 mt-4'>
                  {!review.isApproved && (
                    <Button
                      size='sm'
                      onClick={() => {
                        if (
                          confirm(
                            'Are you sure you want to approve this review?'
                          )
                        ) {
                          approveReviewMutation.mutate(review.id);
                        }
                      }}
                      disabled={approveReviewMutation.isPending}
                    >
                      <CheckCircle className='h-4 w-4 mr-1' />
                      Approve
                    </Button>
                  )}
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      // TODO: Implement reject review
                      console.log('Reject review:', review.id);
                    }}
                  >
                    <XCircle className='h-4 w-4 mr-1' />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <Card>
          <CardContent className='text-center py-12'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              No reviews found
            </h3>
            <p className='text-gray-600'>
              {searchTerm || statusFilter !== 'all'
                ? 'No reviews match your search criteria.'
                : "You don't have any reviews yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
