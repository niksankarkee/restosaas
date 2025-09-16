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
import { api } from '@/lib/api';

interface Course {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
}

interface Menu {
  id: string;
  title: string;
  description?: string;
  courses: Course[];
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && restaurantSlug) {
      fetchMenus();
    }
  }, [isOpen, restaurantSlug]);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/restaurants/${restaurantSlug}/menus`);
      setMenus(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
      setError('Failed to load menus. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Restaurant Menu</DialogTitle>
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
              onClick={fetchMenus}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
            >
              Try Again
            </button>
          </div>
        ) : menus.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-gray-600'>No menus available at this time.</p>
          </div>
        ) : (
          <div className='space-y-6'>
            {menus.map((menu) => (
              <Card key={menu.id}>
                <CardHeader>
                  <CardTitle className='text-xl'>{menu.title}</CardTitle>
                  {menu.description && (
                    <p className='text-gray-600'>{menu.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {menu.courses && menu.courses.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {menu.courses.map((course) => (
                        <div
                          key={course.id}
                          className='border rounded-lg p-4 hover:shadow-md transition-shadow'
                        >
                          {course.imageUrl && (
                            <img
                              src={course.imageUrl}
                              alt={course.name}
                              className='w-full h-32 object-cover rounded mb-3'
                            />
                          )}
                          <div className='flex justify-between items-start mb-2'>
                            <h4 className='font-semibold text-gray-900'>
                              {course.name}
                            </h4>
                            <span className='text-lg font-bold text-green-600'>
                              ${course.price}
                            </span>
                          </div>
                          {course.description && (
                            <p className='text-sm text-gray-600'>
                              {course.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-gray-500 text-center py-4'>
                      No courses in this menu yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
