'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface Review {
  ID: string;
  CustomerName: string;
  Rating: number;
  Title: string;
  Comment: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface RestaurantReviewsProps {
  restaurantSlug: string;
  avgRating: number;
  reviewCount: number;
}

export function RestaurantReviews({
  restaurantSlug,
  avgRating,
  reviewCount,
}: RestaurantReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [restaurantSlug]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/restaurants/${restaurantSlug}/reviews`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className='p-6'>
              <div className='animate-pulse'>
                <div className='flex items-center space-x-4 mb-4'>
                  <div className='h-10 w-10 bg-gray-200 rounded-full'></div>
                  <div className='space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-32'></div>
                    <div className='h-3 bg-gray-200 rounded w-20'></div>
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                  <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='text-center py-12'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Failed to Load Reviews
          </h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <Button onClick={fetchReviews}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className='text-center py-12'>
          <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            No Reviews Yet
          </h3>
          <p className='text-gray-600'>
            Be the first to share your experience at this restaurant!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Star className='h-5 w-5 text-yellow-500' />
            <span>Customer Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-4'>
            <div className='text-center'>
              <div className='text-4xl font-bold text-gray-900'>
                {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
              </div>
              <div className='flex items-center justify-center space-x-1 mt-1'>
                {renderStars(Math.round(avgRating))}
              </div>
              <div className='text-sm text-gray-500 mt-1'>
                Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </div>
            </div>
            <div className='flex-1'>
              <div className='space-y-2'>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter(
                    (r) => r.Rating === rating
                  ).length;
                  const percentage =
                    reviewCount > 0 ? (count / reviewCount) * 100 : 0;

                  return (
                    <div key={rating} className='flex items-center space-x-2'>
                      <span className='text-sm font-medium w-8'>{rating}</span>
                      <Star className='h-4 w-4 text-yellow-400' />
                      <div className='flex-1 bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-yellow-400 h-2 rounded-full'
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className='text-sm text-gray-500 w-8'>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className='space-y-4'>
        {reviews.map((review) => (
          <Card key={review.ID}>
            <CardContent className='p-6'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center space-x-3'>
                  <div className='h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center'>
                    <span className='text-sm font-medium text-gray-600'>
                      {review.CustomerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>
                      {review.CustomerName}
                    </h4>
                    <div className='flex items-center space-x-1'>
                      {renderStars(review.Rating)}
                    </div>
                  </div>
                </div>
                <div className='text-sm text-gray-500 flex items-center space-x-1'>
                  <Calendar className='h-4 w-4' />
                  <span>{formatDate(review.CreatedAt)}</span>
                </div>
              </div>

              <div className='space-y-2'>
                <h5 className='font-medium text-gray-900'>{review.Title}</h5>
                <p className='text-gray-600 leading-relaxed'>
                  {review.Comment}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
