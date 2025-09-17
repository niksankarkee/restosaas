'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  Users,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  coursePrice: number;
  originalPrice?: number;
  numberOfItems: number;
  stayTime: number;
  courseContent: string;
  precautions: string;
  createdAt: string;
  updatedAt: string;
}

function CourseDetailContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      const response = await api.get(
        `/owner/restaurants/${restaurantId}/courses/${courseId}`
      );
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
      router.push('/owner-dashboard/menus');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCourse = async (data: any) => {
    if (!course) return;

    try {
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      const response = await api.put(
        `/owner/restaurants/${restaurantId}/courses/${course.id}`,
        data
      );
      setCourse(response.data);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course || !confirm('Are you sure you want to delete this course?'))
      return;

    try {
      const restaurantResponse = await api.get('/owner/restaurants/me');
      const restaurantId = restaurantResponse.data.id;

      await api.delete(
        `/owner/restaurants/${restaurantId}/courses/${course.id}`
      );
      router.push('/owner-dashboard/menus');
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='max-w-4xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
            <div className='h-64 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className='p-6'>
        <div className='max-w-4xl mx-auto'>
          <Card>
            <CardContent className='text-center py-12'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Course not found
              </h3>
              <p className='text-gray-600 mb-4'>
                The course you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/owner-dashboard/menus')}>
                Back to Menu Management
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex items-center gap-4 mb-6'>
          <Button
            variant='outline'
            onClick={() => router.push('/owner-dashboard/menus')}
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back
          </Button>
          <div className='flex-1'>
            <h1 className='text-3xl font-bold text-gray-900'>{course.title}</h1>
            <p className='text-gray-600 mt-1'>{course.description}</p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => setIsEditDialogOpen(true)}>
              <Edit className='w-4 h-4 mr-2' />
              Edit
            </Button>
            <Button variant='destructive' onClick={handleDeleteCourse}>
              <Trash2 className='w-4 h-4 mr-2' />
              Delete
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-6'>
            {course.imageUrl && (
              <Card>
                <div className='aspect-video overflow-hidden rounded-t-lg'>
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className='w-full h-full object-cover'
                  />
                </div>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                {course.courseContent ? (
                  <div
                    className='prose max-w-none'
                    dangerouslySetInnerHTML={{ __html: course.courseContent }}
                  />
                ) : (
                  <p className='text-gray-500 italic'>No content provided</p>
                )}
              </CardContent>
            </Card>

            {course.precautions && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <AlertTriangle className='w-5 h-5 text-amber-500' />
                    Precautions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-700'>{course.precautions}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Price</span>
                  <div className='text-right'>
                    {course.originalPrice ? (
                      <div>
                        <span className='text-lg font-semibold text-green-600'>
                          {formatPrice(course.coursePrice)}
                        </span>
                        <span className='text-sm text-gray-500 line-through ml-2'>
                          {formatPrice(course.originalPrice)}
                        </span>
                      </div>
                    ) : (
                      <span className='text-lg font-semibold text-green-600'>
                        {formatPrice(course.coursePrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-gray-600 flex items-center gap-2'>
                    <Users className='w-4 h-4' />
                    Items
                  </span>
                  <span className='font-semibold'>{course.numberOfItems}</span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-gray-600 flex items-center gap-2'>
                    <Clock className='w-4 h-4' />
                    Stay Time
                  </span>
                  <span className='font-semibold'>
                    {formatTime(course.stayTime)}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Created</span>
                  <span className='text-sm text-gray-500'>
                    {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Updated</span>
                  <span className='text-sm text-gray-500'>
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Button
                  className='w-full'
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className='w-4 h-4 mr-2' />
                  Edit Course
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => router.push('/owner-dashboard/menus')}
                >
                  Back to Menu Management
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Course Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
            </DialogHeader>
            <CourseForm
              initialData={course}
              onSubmit={handleUpdateCourse}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  return <CourseDetailContent />;
}

// Course Form Component (reused from menus page)
function CourseForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData: Course;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    coursePrice: initialData?.coursePrice ? initialData.coursePrice / 100 : 0,
    originalPrice: initialData?.originalPrice
      ? initialData.originalPrice / 100
      : '',
    numberOfItems: initialData?.numberOfItems || 1,
    stayTime: initialData?.stayTime || 60,
    courseContent: initialData?.courseContent || '',
    precautions: initialData?.precautions || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      coursePrice: Math.round(formData.coursePrice * 100), // Convert to cents and round
      originalPrice: formData.originalPrice
        ? Math.round(parseFloat(formData.originalPrice) * 100)
        : null,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Course Title *
          </label>
          <input
            type='text'
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Image URL
          </label>
          <input
            type='url'
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='https://example.com/image.jpg'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Course Price ($) *
          </label>
          <input
            type='number'
            step='0.01'
            value={formData.coursePrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                coursePrice: parseFloat(e.target.value) || 0,
              })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Original Price ($)
          </label>
          <input
            type='number'
            step='0.01'
            value={formData.originalPrice}
            onChange={(e) =>
              setFormData({ ...formData, originalPrice: e.target.value })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='For strikethrough pricing'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Number of Items *
          </label>
          <input
            type='number'
            min='1'
            value={formData.numberOfItems}
            onChange={(e) =>
              setFormData({
                ...formData,
                numberOfItems: parseInt(e.target.value) || 1,
              })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Stay Time (minutes) *
        </label>
        <input
          type='number'
          min='1'
          value={formData.stayTime}
          onChange={(e) =>
            setFormData({
              ...formData,
              stayTime: parseInt(e.target.value) || 60,
            })
          }
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Course Content (Rich Text)
        </label>
        <RichTextEditor
          value={formData.courseContent}
          onChange={(value) =>
            setFormData({ ...formData, courseContent: value })
          }
          placeholder='Detailed course content with rich text formatting...'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Precautions
        </label>
        <textarea
          value={formData.precautions}
          onChange={(e) =>
            setFormData({ ...formData, precautions: e.target.value })
          }
          rows={3}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='Any precautions or special notes...'
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit'>Update Course</Button>
      </div>
    </form>
  );
}
