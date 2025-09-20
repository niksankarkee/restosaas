'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  MapPin,
  DollarSign,
  Star,
  Utensils,
  Camera,
  MessageSquare,
  Navigation,
} from 'lucide-react';
import { WriteReviewDialog } from '@/components/write-review-dialog';
import { EnhancedReservationDialog } from '@/components/enhanced-reservation-dialog';
import { RestaurantGallery } from '@/components/restaurant-gallery';
import { RestaurantReviews } from '@/components/restaurant-reviews';
import { RestaurantMap } from '@/components/restaurant-map';
import { useAuth } from '@/contexts/auth-context';
import type { Menu as ApiMenu, Course as ApiCourse } from '@restosaas/types';

interface Restaurant {
  ID: string;
  Slug: string;
  Name: string;
  Slogan: string;
  Place: string;
  Genre: string;
  Budget: string;
  Title: string;
  Description: string;
  Address: string;
  Phone: string;
  Timezone: string;
  Capacity: number;
  IsOpen: boolean;
  MainImageID?: string;
  OpenHours: OpeningHour[];
  Menus: Menu[];
  Images: Image[];
  AvgRating: number;
  ReviewCount: number;
  CreatedAt: string;
  UpdatedAt: string;
}

interface OpeningHour {
  ID: string;
  Weekday: number;
  OpenTime: string;
  CloseTime: string;
  IsClosed: boolean;
}

interface Menu {
  id: string;
  name: string;
  shortDesc: string;
  imageUrl?: string;
  price: number;
  type: 'FOOD' | 'DRINK';
  mealType: 'LUNCH' | 'DINNER' | 'BOTH';
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
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

interface Image {
  ID: string;
  URL: string;
  Alt: string;
  IsMain: boolean;
  DisplayOrder: number;
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

// Helper function to format price range
const formatPriceRange = (restaurant: Restaurant): string => {
  // If budget contains a range format like "500-1500" or "500 ~ 1500"
  if (
    restaurant.Budget &&
    (restaurant.Budget.includes('-') || restaurant.Budget.includes('~'))
  ) {
    return `Rs (${restaurant.Budget})`;
  }
  // If budget is a single value
  if (restaurant.Budget && !restaurant.Budget.includes('$')) {
    return `Rs (${restaurant.Budget})`;
  }
  // Fallback to old budget format if price range not available
  return restaurant.Budget.replace(/\$/g, 'Rs ');
};

export default function RestaurantPage({
  params,
}: {
  params: { slug: string };
}) {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [menuTab, setMenuTab] = useState<'all' | 'courses' | 'drinks'>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [isMakeReservationOpen, setIsMakeReservationOpen] = useState(false);
  const [isSettingMainImage, setIsSettingMainImage] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, [params.slug]);

  useEffect(() => {
    if (restaurant?.Slug) {
      fetchMenuData();
    }
  }, [restaurant?.Slug]);

  const fetchMenuData = async () => {
    if (!restaurant?.Slug) return;

    try {
      setIsMenuLoading(true);
      const [menusResponse, coursesResponse] = await Promise.all([
        api.get(`/restaurants/${restaurant.Slug}/menus`),
        api.get(`/restaurants/${restaurant.Slug}/courses`),
      ]);

      setMenus(
        Array.isArray(menusResponse.data)
          ? menusResponse.data
          : menusResponse.data.menus || []
      );
      setCourses(
        Array.isArray(coursesResponse.data)
          ? coursesResponse.data
          : coursesResponse.data.courses || []
      );
    } catch (error) {
      console.error('Failed to fetch menu data:', error);
    } finally {
      setIsMenuLoading(false);
    }
  };

  const getFilteredMenus = () => {
    switch (menuTab) {
      case 'drinks':
        return menus.filter((menu) => menu.type === 'DRINK');
      case 'courses':
        return [];
      case 'all':
      default:
        return menus;
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleCourseClick = (course: Course) => {
    // Navigate to full page course view
    window.location.href = `/r/${params.slug}/courses/${course.id}`;
  };

  const handleCourseReservation = (course: Course) => {
    // Set the course for reservation and open reservation dialog
    setSelectedCourse(course);
    setIsMakeReservationOpen(true);
  };

  const handleSetMainImage = async (imageId: string) => {
    if (
      !restaurant ||
      !user ||
      (user.role !== 'OWNER' && user.role !== 'SUPER_ADMIN')
    ) {
      return;
    }

    setIsSettingMainImage(true);
    try {
      await api.post(
        `/owner/restaurants/${restaurant.ID}/images/${imageId}/set-main`
      );

      // Update local state
      setRestaurant((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          Images: prev.Images.map((img) => ({
            ...img,
            IsMain: img.ID === imageId,
          })),
        };
      });
    } catch (error) {
      console.error('Failed to set main image:', error);
    } finally {
      setIsSettingMainImage(false);
    }
  };

  const fetchRestaurant = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/restaurants/${params.slug}`);
      setRestaurant(data);
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
      setRestaurant(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='max-w-6xl mx-auto p-6'>
        <div className='animate-pulse'>
          <div className='h-12 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='h-6 bg-gray-200 rounded w-1/4 mb-6'></div>
          <div className='h-64 bg-gray-200 rounded mb-8'></div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-32 bg-gray-200 rounded'></div>
            ))}
          </div>
          <div className='flex gap-4 mb-8'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-12 bg-gray-200 rounded flex-1'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <Card>
          <CardContent className='text-center py-12'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Restaurant Not Found
            </h1>
            <p className='text-gray-600'>
              The restaurant you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mainImage =
    restaurant.Images?.find((img) => img.IsMain) || restaurant.Images?.[0];

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Restaurant Header */}
      <div className='mb-8'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
          <div>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              {restaurant.Name}
            </h1>
            <div className='flex items-center text-gray-600 mb-2'>
              <MapPin className='h-4 w-4 mr-1' />
              <span>{restaurant.Place}</span>
            </div>
            {restaurant.Slogan && (
              <p className='text-lg text-gray-700 italic'>
                "{restaurant.Slogan}"
              </p>
            )}
          </div>
          <div className='flex items-center space-x-2 mt-4 md:mt-0'>
            <Badge variant={restaurant.IsOpen ? 'default' : 'secondary'}>
              {restaurant.IsOpen ? 'Open' : 'Closed'}
            </Badge>
            {restaurant.Genre && (
              <Badge variant='outline'>{restaurant.Genre}</Badge>
            )}
            {restaurant.AvgRating > 0 && (
              <div className='flex items-center space-x-1'>
                <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                <span className='text-sm font-medium'>
                  {restaurant.AvgRating.toFixed(1)} ({restaurant.ReviewCount})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Image */}
        {mainImage && (
          <div className='mb-6 relative group'>
            <img
              src={mainImage.URL}
              alt={mainImage.Alt || restaurant.Name}
              className='w-full h-64 md:h-96 object-cover rounded-lg shadow-lg'
            />
            {/* Set as Main Image Button - Only for Owners and Super Admins */}
            {user && (user.role === 'OWNER' || user.role === 'SUPER_ADMIN') && (
              <div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity'>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSetMainImage(mainImage.ID);
                  }}
                  disabled={isSettingMainImage || mainImage.IsMain}
                  className='bg-white/90 hover:bg-white text-gray-900 z-10'
                >
                  <Star className='w-4 h-4 mr-2' />
                  {mainImage.IsMain ? 'Main Image' : 'Set as Main'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quick Info Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          {restaurant.Budget && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg flex items-center'>
                  <DollarSign className='h-5 w-5 mr-2' />
                  Price Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold text-green-600'>
                  {formatPriceRange(restaurant)}
                </p>
              </CardContent>
            </Card>
          )}

          {restaurant.Genre && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg flex items-center'>
                  <Utensils className='h-5 w-5 mr-2' />
                  Cuisine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-lg font-semibold'>{restaurant.Genre}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center'>
                <Clock className='h-5 w-5 mr-2' />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={restaurant.IsOpen ? 'default' : 'secondary'}
                className='text-lg px-3 py-1'
              >
                {restaurant.IsOpen ? 'Currently Open' : 'Currently Closed'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center'>
                <Star className='h-5 w-5 mr-2' />
                Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-1'>
                <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                <span className='text-2xl font-bold'>
                  {restaurant.AvgRating > 0
                    ? restaurant.AvgRating.toFixed(1)
                    : 'N/A'}
                </span>
                <span className='text-sm text-gray-500'>
                  ({restaurant.ReviewCount})
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 mb-8'>
          <Button
            size='lg'
            className='flex-1'
            onClick={() => setIsMakeReservationOpen(true)}
          >
            Make a Reservation
          </Button>
          <Button
            size='lg'
            variant='outline'
            className='flex-1'
            onClick={() => setIsWriteReviewOpen(true)}
          >
            Write a Review
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview' className='flex items-center gap-2'>
            <Utensils className='h-4 w-4' />
            Overview
          </TabsTrigger>
          <TabsTrigger value='menu' className='flex items-center gap-2'>
            <Utensils className='h-4 w-4' />
            Menu
          </TabsTrigger>
          <TabsTrigger value='gallery' className='flex items-center gap-2'>
            <Camera className='h-4 w-4' />
            Gallery
          </TabsTrigger>
          <TabsTrigger value='reviews' className='flex items-center gap-2'>
            <MessageSquare className='h-4 w-4' />
            Reviews
          </TabsTrigger>
          <TabsTrigger value='map' className='flex items-center gap-2'>
            <Navigation className='h-4 w-4' />
            Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='mt-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Description */}
            {restaurant.Description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className='prose prose-gray max-w-none'
                    dangerouslySetInnerHTML={{ __html: restaurant.Description }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Opening Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Opening Hours</CardTitle>
              </CardHeader>
              <CardContent>
                {restaurant.OpenHours && restaurant.OpenHours.length > 0 ? (
                  <div className='space-y-2'>
                    {restaurant.OpenHours.sort(
                      (a, b) => a.Weekday - b.Weekday
                    ).map((hour) => (
                      <div
                        key={hour.ID}
                        className='flex justify-between items-center'
                      >
                        <span className='font-medium'>
                          {WEEKDAYS[hour.Weekday]}
                        </span>
                        <span
                          className={
                            hour.IsClosed ? 'text-red-500' : 'text-gray-600'
                          }
                        >
                          {hour.IsClosed
                            ? 'Closed'
                            : `${hour.OpenTime} - ${hour.CloseTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-gray-500'>Opening hours not available</p>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {restaurant.Address && (
                  <div className='flex items-start space-x-2'>
                    <MapPin className='h-5 w-5 text-gray-400 mt-0.5' />
                    <span className='text-gray-600'>{restaurant.Address}</span>
                  </div>
                )}
                {restaurant.Phone && (
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-5 w-5 text-gray-400' />
                    <span className='text-gray-600'>{restaurant.Phone}</span>
                  </div>
                )}
                <div className='flex items-center space-x-2'>
                  <Utensils className='h-5 w-5 text-gray-400' />
                  <span className='text-gray-600'>
                    Capacity: {restaurant.Capacity} people
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Details</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Cuisine Type:</span>
                  <span className='font-medium'>{restaurant.Genre}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Price Range:</span>
                  <span className='font-medium'>
                    {formatPriceRange(restaurant)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Location:</span>
                  <span className='font-medium'>{restaurant.Place}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Timezone:</span>
                  <span className='font-medium'>{restaurant.Timezone}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='menu' className='mt-6'>
          <div className='space-y-6'>
            {/* Sub-tabs for Menu, Course, Drink */}
            <Tabs
              value={menuTab}
              onValueChange={(value) =>
                setMenuTab(value as 'all' | 'courses' | 'drinks')
              }
            >
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='all'>Menu Items</TabsTrigger>
                <TabsTrigger value='courses'>Courses</TabsTrigger>
                <TabsTrigger value='drinks'>Drinks</TabsTrigger>
              </TabsList>

              <TabsContent value='all' className='mt-6'>
                {isMenuLoading ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className='animate-pulse'>
                        <div className='h-48 bg-gray-200 rounded mb-4'></div>
                        <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                        <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                      </div>
                    ))}
                  </div>
                ) : menus.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {menus.map((menu) => (
                      <Card
                        key={menu.id}
                        className='overflow-hidden hover:shadow-md transition-shadow'
                      >
                        {menu.imageUrl && (
                          <div className='aspect-video overflow-hidden'>
                            <img
                              src={menu.imageUrl}
                              alt={menu.name}
                              className='w-full h-full object-cover'
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className='text-lg'>{menu.name}</CardTitle>
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant={
                                menu.type === 'DRINK' ? 'default' : 'secondary'
                              }
                            >
                              {menu.type}
                            </Badge>
                            <Badge variant='outline'>{menu.mealType}</Badge>
                            <span className='text-lg font-semibold text-green-600'>
                              Rs ${menu.price}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className='text-gray-600 text-sm'>
                            {menu.shortDesc}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className='text-center py-8'>
                      <p className='text-gray-600'>No menu items available.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value='courses' className='mt-6'>
                {isMenuLoading ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className='animate-pulse'>
                        <div className='h-48 bg-gray-200 rounded mb-4'></div>
                        <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                        <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                      </div>
                    ))}
                  </div>
                ) : courses.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {courses.map((course) => (
                      <Card
                        key={course.id}
                        className='overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105'
                        onClick={() => handleCourseClick(course)}
                      >
                        {course.imageUrl && (
                          <div className='aspect-video overflow-hidden'>
                            <img
                              src={course.imageUrl}
                              alt={course.title}
                              className='w-full h-full object-cover'
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className='text-lg'>
                            {course.title}
                          </CardTitle>
                          <div className='flex items-center gap-4 text-sm text-gray-600'>
                            <div className='flex items-center gap-1'>
                              <span
                                className={
                                  course.originalPrice ? 'line-through' : ''
                                }
                              >
                                Rs ${course.coursePrice}
                              </span>
                              {course.originalPrice && (
                                <span className='text-green-600 font-semibold'>
                                  Rs ${course.originalPrice}
                                </span>
                              )}
                            </div>
                            <div className='flex items-center gap-1'>
                              <span>{course.numberOfItems} items</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <span>
                                {Math.floor(course.stayTime / 60)}h{' '}
                                {course.stayTime % 60}m
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className='text-gray-600 text-sm mb-3'>
                            {course.description}
                          </p>
                          {course.courseContent && (
                            <div
                              className='prose prose-sm max-w-none'
                              dangerouslySetInnerHTML={{
                                __html: truncateContent(
                                  course.courseContent,
                                  100
                                ),
                              }}
                            />
                          )}
                          <div className='mt-4 flex justify-center'>
                            <Button
                              size='sm'
                              className='w-full'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCourseClick(course);
                              }}
                            >
                              View Full Course
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className='text-center py-8'>
                      <p className='text-gray-600'>No courses available.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value='drinks' className='mt-6'>
                {isMenuLoading ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className='animate-pulse'>
                        <div className='h-48 bg-gray-200 rounded mb-4'></div>
                        <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                        <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                      </div>
                    ))}
                  </div>
                ) : getFilteredMenus().length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {getFilteredMenus().map((menu) => (
                      <Card key={menu.id} className='overflow-hidden'>
                        {menu.imageUrl && (
                          <div className='aspect-video overflow-hidden'>
                            <img
                              src={menu.imageUrl}
                              alt={menu.name}
                              className='w-full h-full object-cover'
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className='text-lg'>{menu.name}</CardTitle>
                          <div className='flex items-center gap-2'>
                            <Badge variant='outline'>{menu.mealType}</Badge>
                            <span className='text-lg font-semibold text-green-600'>
                              Rs ${menu.price}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className='text-gray-600 text-sm'>
                            {menu.shortDesc}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className='text-center py-8'>
                      <p className='text-gray-600'>No drinks available.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value='gallery' className='mt-6'>
          <RestaurantGallery
            images={restaurant.Images || []}
            onSetMainImage={handleSetMainImage}
            canSetMainImage={
              !!(user && (user.role === 'OWNER' || user.role === 'SUPER_ADMIN'))
            }
          />
        </TabsContent>

        <TabsContent value='reviews' className='mt-6'>
          <RestaurantReviews
            restaurantSlug={params.slug}
            avgRating={restaurant.AvgRating}
            reviewCount={restaurant.ReviewCount}
          />
        </TabsContent>

        <TabsContent value='map' className='mt-6'>
          <RestaurantMap
            name={restaurant.Name}
            address={restaurant.Address}
            place={restaurant.Place}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}

      <WriteReviewDialog
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        restaurantSlug={params.slug}
        onReviewSubmitted={() => {
          // Refresh restaurant data to get updated reviews
          fetchRestaurant();
        }}
      />

      <EnhancedReservationDialog
        isOpen={isMakeReservationOpen}
        onClose={() => setIsMakeReservationOpen(false)}
        restaurantSlug={params.slug}
        restaurantName={restaurant.Name}
        restaurantCapacity={restaurant.Capacity}
        openHours={restaurant.OpenHours}
        courseId={selectedCourse?.id} // Pass course ID for course-specific reservations
        onReservationSubmitted={() => {
          console.log('Reservation submitted successfully');
        }}
      />
    </div>
  );
}
