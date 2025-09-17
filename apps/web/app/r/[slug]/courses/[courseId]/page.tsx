'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Clock,
  Users,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { EnhancedReservationDialog } from '@/components/enhanced-reservation-dialog';

interface Course {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  imageUrl?: string;
  coursePrice: number;
  originalPrice?: number;
  numberOfItems: number;
  stayTime: number;
  courseContent: string;
  precautions: string;
  createdAt: string;
  updatedAt: string;
}

interface Restaurant {
  id: string;
  slug: string;
  name: string;
  capacity: number;
  openHours: any[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  useEffect(() => {
    if (params.slug && params.courseId) {
      fetchCourseData();
    }
  }, [params.slug, params.courseId]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      const courseId = Array.isArray(params.courseId)
        ? params.courseId[0]
        : params.courseId;

      const [courseResponse, restaurantResponse] = await Promise.all([
        api.get(`/restaurants/${slug}/courses/${courseId}`),
        api.get(`/restaurants/${slug}`),
      ]);

      setCourse(courseResponse.data);
      setRestaurant(restaurantResponse.data);
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservation = () => {
    setIsReservationOpen(true);
  };

  const handleBack = () => {
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    router.push(`/r/${slug}`);
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='container mx-auto px-4 py-8'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-32 mb-6'></div>
            <div className='h-64 bg-gray-200 rounded mb-6'></div>
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course || !restaurant) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='max-w-md mx-auto'>
          <CardContent className='text-center py-8'>
            <h2 className='text-xl font-semibold mb-2'>Course Not Found</h2>
            <p className='text-gray-600 mb-4'>
              The course you're looking for doesn't exist.
            </p>
            <Button onClick={handleBack}>Back to Restaurant</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-6'>
          <Button variant='outline' onClick={handleBack} className='mb-4'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Restaurant
          </Button>
          <h1 className='text-3xl font-bold text-gray-900'>{course.title}</h1>
          <p className='text-gray-600 mt-2'>{course.description}</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Course Image */}
            {course.imageUrl && (
              <Card className='overflow-hidden'>
                <div className='aspect-video overflow-hidden'>
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className='w-full h-full object-cover'
                  />
                </div>
              </Card>
            )}

            {/* Course Content */}
            {course.courseContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className='prose prose-sm max-w-none'
                    dangerouslySetInnerHTML={{
                      __html: course.courseContent,
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Precautions */}
            {course.precautions && (
              <Card className='border-amber-200 bg-amber-50'>
                <CardHeader>
                  <CardTitle className='flex items-center text-amber-800'>
                    <AlertTriangle className='h-5 w-5 mr-2' />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-amber-800 whitespace-pre-line'>
                    {course.precautions}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <DollarSign className='h-5 w-5 mr-2' />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-green-600'>
                    Rs ${course.coursePrice}
                  </div>
                  {course.originalPrice && (
                    <div className='text-lg text-gray-500 line-through'>
                      Rs ${course.originalPrice}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleReservation}
                  className='w-full'
                  size='lg'
                >
                  Reserve This Course
                </Button>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Items Included</span>
                  <Badge variant='outline'>{course.numberOfItems} items</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Duration</span>
                  <div className='flex items-center'>
                    <Clock className='h-4 w-4 mr-1' />
                    <span>
                      {Math.floor(course.stayTime / 60)}h {course.stayTime % 60}
                      m
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Restaurant</span>
                  <span className='font-medium'>{restaurant.name}</span>
                </div>
              </CardContent>
            </Card>

            {/* Restaurant Info */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>Capacity</span>
                    <div className='flex items-center'>
                      <Users className='h-4 w-4 mr-1' />
                      <span>{restaurant.capacity} people</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant='outline'
                  className='w-full mt-4'
                  onClick={() => {
                    const slug = Array.isArray(params.slug)
                      ? params.slug[0]
                      : params.slug;
                    router.push(`/r/${slug}`);
                  }}
                >
                  View Restaurant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reservation Dialog */}
      <EnhancedReservationDialog
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        restaurantSlug={
          Array.isArray(params.slug) ? params.slug[0] : params.slug
        }
        restaurantName={restaurant.name}
        restaurantCapacity={restaurant.capacity}
        openHours={restaurant.openHours}
        courseId={course.id}
        onReservationSubmitted={() => {
          console.log('Course reservation submitted successfully');
          setIsReservationOpen(false);
        }}
      />
    </div>
  );
}
