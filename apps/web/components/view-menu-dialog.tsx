'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';

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

interface Menu {
  id: string;
  name: string;
  shortDesc: string;
  imageUrl: string;
  price: number;
  type: 'DRINK' | 'FOOD';
  mealType: 'LUNCH' | 'DINNER' | 'BOTH';
  createdAt: string;
  updatedAt: string;
}

interface ViewMenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantSlug: string;
}

export function ViewMenuDialog({
  isOpen,
  onClose,
  restaurantSlug,
}: ViewMenuDialogProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'menus' | 'courses'>('menus');

  useEffect(() => {
    if (isOpen && restaurantSlug) {
      fetchData();
    }
  }, [isOpen, restaurantSlug]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both menus and courses in parallel
      const [menusResponse, coursesResponse] = await Promise.all([
        api.get(`/restaurants/${restaurantSlug}/menus`),
        api.get(`/restaurants/${restaurantSlug}/courses`),
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
      console.error('Failed to fetch data:', error);
      setError('Failed to load menu data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `Rs ${price}`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getFilteredMenus = (
    type?: 'DRINK' | 'FOOD',
    mealType?: 'LUNCH' | 'DINNER' | 'BOTH'
  ) => {
    return menus.filter((menu) => {
      if (type && menu.type !== type) return false;
      if (mealType && menu.mealType !== mealType && menu.mealType !== 'BOTH')
        return false;
      return true;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-6xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Restaurant Menu & Courses</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='animate-pulse'>
                <div className='h-6 bg-gray-200 rounded w-1/3 mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-1/2 mb-4'></div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {[1, 2, 3].map((j) => (
                    <div key={j} className='h-32 bg-gray-200 rounded'></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className='text-center py-8'>
            <p className='text-red-600 mb-4'>{error}</p>
            <button
              onClick={fetchData}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
            >
              Try Again
            </button>
          </div>
        ) : menus.length === 0 && courses.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-gray-600'>
              No menus or courses available at this time.
            </p>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'menus' | 'courses')
            }
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='menus'>Menu Items</TabsTrigger>
              <TabsTrigger value='courses'>Courses</TabsTrigger>
            </TabsList>

            <TabsContent value='menus' className='mt-6'>
              <div className='space-y-6'>
                {/* All Menu Items */}
                <div>
                  <h3 className='text-lg font-semibold mb-4'>All Menu Items</h3>
                  {menus.length === 0 ? (
                    <p className='text-gray-500 text-center py-4'>
                      No menu items available.
                    </p>
                  ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {menus.map((menu) => (
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
                            <CardTitle className='text-lg'>
                              {menu.name}
                            </CardTitle>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant={
                                  menu.type === 'DRINK'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {menu.type}
                              </Badge>
                              <Badge variant='outline'>{menu.mealType}</Badge>
                              <span className='text-lg font-semibold text-green-600'>
                                {formatPrice(menu.price)}
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
                  )}
                </div>

                {/* Drinks */}
                {getFilteredMenus('DRINK').length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-4'>Drinks</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {getFilteredMenus('DRINK').map((menu) => (
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
                            <CardTitle className='text-lg'>
                              {menu.name}
                            </CardTitle>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline'>{menu.mealType}</Badge>
                              <span className='text-lg font-semibold text-green-600'>
                                {formatPrice(menu.price)}
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
                  </div>
                )}

                {/* Lunch Items */}
                {getFilteredMenus('FOOD', 'LUNCH').length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-4'>Lunch</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {getFilteredMenus('FOOD', 'LUNCH').map((menu) => (
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
                            <CardTitle className='text-lg'>
                              {menu.name}
                            </CardTitle>
                            <div className='flex items-center gap-2'>
                              <span className='text-lg font-semibold text-green-600'>
                                {formatPrice(menu.price)}
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
                  </div>
                )}

                {/* Dinner Items */}
                {getFilteredMenus('FOOD', 'DINNER').length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-4'>Dinner</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {getFilteredMenus('FOOD', 'DINNER').map((menu) => (
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
                            <CardTitle className='text-lg'>
                              {menu.name}
                            </CardTitle>
                            <div className='flex items-center gap-2'>
                              <span className='text-lg font-semibold text-green-600'>
                                {formatPrice(menu.price)}
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
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value='courses' className='mt-6'>
              <div className='space-y-6'>
                {courses.length === 0 ? (
                  <p className='text-gray-500 text-center py-4'>
                    No courses available.
                  </p>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {courses.map((course) => (
                      <Card key={course.id} className='overflow-hidden'>
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
                                {formatPrice(course.coursePrice)}
                              </span>
                              {course.originalPrice && (
                                <span className='text-green-600 font-semibold'>
                                  {formatPrice(course.originalPrice)}
                                </span>
                              )}
                            </div>
                            <div className='flex items-center gap-1'>
                              <span>{course.numberOfItems} items</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <span>{formatTime(course.stayTime)}</span>
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
                                __html: course.courseContent,
                              }}
                            />
                          )}
                          {course.precautions && (
                            <div className='mt-3 p-2 bg-amber-50 border border-amber-200 rounded'>
                              <p className='text-sm text-amber-800'>
                                <strong>Precautions:</strong>{' '}
                                {course.precautions}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
