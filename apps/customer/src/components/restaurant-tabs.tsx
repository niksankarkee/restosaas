'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import { Button } from '@restosaas/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@restosaas/ui';
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

interface RestaurantTabsProps {
  slug: string;
}

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
  ID: string;
  Title: string;
  Description: string;
  Courses: Course[];
}

interface Course {
  ID: string;
  Name: string;
  Price: number;
  ImageURL: string;
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

export function RestaurantTabs({ slug }: RestaurantTabsProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [menuTab, setMenuTab] = useState<'all' | 'courses' | 'drinks'>('all');

  useEffect(() => {
    fetchRestaurant();
  }, [slug]);

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
        fetch(`/api/restaurants/${restaurant.Slug}/menus`).then((res) =>
          res.json()
        ),
        fetch(`/api/restaurants/${restaurant.Slug}/courses`).then((res) =>
          res.json()
        ),
      ]);

      setMenus(
        Array.isArray(menusResponse) ? menusResponse : menusResponse.menus || []
      );
      setCourses(
        Array.isArray(coursesResponse)
          ? coursesResponse
          : coursesResponse.courses || []
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

  const fetchRestaurant = async () => {
    try {
      setIsLoading(true);
      const data = await fetch(`/api/restaurants/${slug}`).then((res) =>
        res.json()
      );
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
      <div className='animate-pulse'>
        <div className='h-12 bg-gray-200 rounded w-1/4 mb-6'></div>
        <div className='h-64 bg-gray-200 rounded'></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
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
    );
  }

  return (
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
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              {restaurant.Description ? (
                <div
                  className='prose prose-gray max-w-none'
                  dangerouslySetInnerHTML={{ __html: restaurant.Description }}
                />
              ) : (
                <p className='text-gray-600'>
                  {restaurant.Title ||
                    'No description available for this restaurant.'}
                </p>
              )}
            </CardContent>
          </Card>

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
                <span className='font-medium'>{restaurant.Budget}</span>
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
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              menu.type === 'DRINK'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {menu.type}
                          </span>
                          <span className='px-2 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700'>
                            {menu.mealType}
                          </span>
                          <span className='text-lg font-semibold text-green-600'>
                            Rs {menu.price}
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
                              Rs {course.coursePrice}
                            </span>
                            {course.originalPrice && (
                              <span className='text-green-600 font-semibold'>
                                Rs {course.originalPrice}
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
                          <Button size='sm' className='w-full'>
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
                          <span className='px-2 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700'>
                            {menu.mealType}
                          </span>
                          <span className='text-lg font-semibold text-green-600'>
                            Rs {menu.price}
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
        <Card>
          <CardContent className='text-center py-12'>
            <Camera className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Photo Gallery
            </h3>
            <p className='text-gray-600'>
              Restaurant photos will be displayed here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='reviews' className='mt-6'>
        <Card>
          <CardContent className='text-center py-12'>
            <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Customer Reviews
            </h3>
            <p className='text-gray-600'>
              Customer reviews will be displayed here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='map' className='mt-6'>
        <Card>
          <CardContent className='text-center py-12'>
            <Navigation className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Location Map
            </h3>
            <p className='text-gray-600'>
              Restaurant location will be displayed here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
