'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/auth/role-guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EnhancedRestaurantForm } from '@/components/forms/enhanced-restaurant-form';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  place: string;
  description?: string;
  slogan?: string;
  genre?: string;
  budget?: string;
  isOpen?: boolean;
  title?: string;
}

function OwnerDashboardContent() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/owner/restaurants/me');
      setRestaurant(response.data);
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantCreated = (data: Restaurant) => {
    setRestaurant(data);
    setIsCreateDialogOpen(false);
  };

  const handleRestaurantUpdated = (data: Restaurant) => {
    setRestaurant(data);
    setIsEditDialogOpen(false);
  };

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
            <h1 className='text-3xl font-bold text-gray-900'>
              Owner Dashboard
            </h1>
            <p className='text-gray-600 mt-2'>
              Manage your restaurant and business
            </p>
          </div>
          {restaurant ? (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline'>Edit Restaurant</Button>
              </DialogTrigger>
              <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>Edit Restaurant</DialogTitle>
                </DialogHeader>
                <div className='max-h-[70vh] overflow-y-auto pr-2'>
                  <EnhancedRestaurantForm
                    initialData={restaurant}
                    onSuccess={handleRestaurantUpdated}
                    onCancel={() => setIsEditDialogOpen(false)}
                    isEdit={true}
                  />
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>Create Restaurant</Button>
              </DialogTrigger>
              <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>Create Restaurant</DialogTitle>
                </DialogHeader>
                <div className='max-h-[70vh] overflow-y-auto pr-2'>
                  <EnhancedRestaurantForm
                    onSuccess={handleRestaurantCreated}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!restaurant ? (
          <Card>
            <CardHeader>
              <CardTitle>No Restaurant Found</CardTitle>
              <CardDescription>
                You don't have a restaurant yet. Create one to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RestaurantForm onSuccess={handleRestaurantCreated} />
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Name</h3>
                    <p className='text-gray-600'>{restaurant.name}</p>
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Location</h3>
                    <p className='text-gray-600'>{restaurant.place}</p>
                  </div>
                  {restaurant.slogan && (
                    <div>
                      <h3 className='font-semibold text-gray-900'>Slogan</h3>
                      <p className='text-gray-600 italic'>
                        "{restaurant.slogan}"
                      </p>
                    </div>
                  )}
                  {restaurant.genre && (
                    <div>
                      <h3 className='font-semibold text-gray-900'>Cuisine</h3>
                      <p className='text-gray-600'>{restaurant.genre}</p>
                    </div>
                  )}
                  {restaurant.budget && (
                    <div>
                      <h3 className='font-semibold text-gray-900'>Budget</h3>
                      <p className='text-gray-600'>{restaurant.budget}</p>
                    </div>
                  )}
                  <div>
                    <h3 className='font-semibold text-gray-900'>Status</h3>
                    <p className='text-gray-600'>
                      {restaurant.isOpen ? 'Open' : 'Closed'}
                    </p>
                  </div>
                </div>
                {restaurant.description && (
                  <div className='mt-4'>
                    <h3 className='font-semibold text-gray-900'>Description</h3>
                    <div
                      className='text-gray-600 prose prose-gray max-w-none'
                      dangerouslySetInnerHTML={{
                        __html: restaurant.description,
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Card>
                <CardContent className='p-6 text-center'>
                  <h3 className='font-semibold text-gray-900 mb-2'>Menus</h3>
                  <p className='text-gray-600 mb-4'>
                    Manage your restaurant menus
                  </p>
                  <Link href='/owner-dashboard/menus'>
                    <Button variant='outline' size='sm' className='w-full'>
                      Manage Menus
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-6 text-center'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    Reservations
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    View and manage reservations
                  </p>
                  <Link href='/owner-dashboard/reservations'>
                    <Button variant='outline' size='sm' className='w-full'>
                      View Reservations
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-6 text-center'>
                  <h3 className='font-semibold text-gray-900 mb-2'>Reviews</h3>
                  <p className='text-gray-600 mb-4'>Manage customer reviews</p>
                  <Link href='/owner-dashboard/reviews'>
                    <Button variant='outline' size='sm' className='w-full'>
                      Manage Reviews
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  return (
    <RoleGuard allowedRoles={['OWNER', 'SUPER_ADMIN']}>
      <OwnerDashboardContent />
    </RoleGuard>
  );
}
