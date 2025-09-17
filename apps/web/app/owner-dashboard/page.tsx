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
import { Badge } from '@/components/ui/badge';
import { EnhancedRestaurantForm } from '@/components/forms/enhanced-restaurant-form';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  Edit,
  MapPin,
  Clock,
  Users,
  Star,
  Image as ImageIcon,
  Utensils,
  Calendar,
  MessageSquare,
} from 'lucide-react';

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
  address?: string;
  phone?: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
  mainImageId?: string;
  images?: Image[];
  openHours?: OpeningHour[];
  menus?: Menu[];
  courses?: Course[];
}

interface Image {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
  displayOrder: number;
}

interface OpeningHour {
  id: string;
  weekday: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
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

function OwnerDashboardContent() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/owner/restaurants/me');
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantCreated = (data: Restaurant) => {
    setRestaurants((prev) => [...prev, data]);
    setIsCreateDialogOpen(false);
  };

  const handleRestaurantUpdated = (data: Restaurant) => {
    setRestaurants((prev) =>
      prev.map((rest) => (rest.id === data.id ? data : rest))
    );
    setIsEditDialogOpen(false);
    setEditingRestaurant(null);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='h-64 bg-gray-200 rounded'></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Owner Dashboard
            </h1>
            <p className='text-gray-600 mt-2'>
              Manage your restaurants and business
            </p>
          </div>
          {restaurants.length === 0 && (
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
                    isEdit={false}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {restaurants.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No Restaurants Found
              </h3>
              <p className='text-gray-600 mb-4'>
                Get started by creating your first restaurant.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Restaurant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-6'>
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onEdit={handleEditRestaurant}
              />
            ))}
          </div>
        )}

        {/* Edit Restaurant Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Restaurant</DialogTitle>
            </DialogHeader>
            <div className='max-h-[70vh] overflow-y-auto pr-2'>
              {editingRestaurant && (
                <EnhancedRestaurantForm
                  initialData={editingRestaurant}
                  onSuccess={handleRestaurantUpdated}
                  onCancel={() => {
                    setIsEditDialogOpen(false);
                    setEditingRestaurant(null);
                  }}
                  isEdit={true}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Restaurant Card Component
function RestaurantCard({
  restaurant,
  onEdit,
}: {
  restaurant: Restaurant;
  onEdit: (restaurant: Restaurant) => void;
}) {
  const mainImage =
    restaurant.images?.find((img) => img.isMain) || restaurant.images?.[0];
  const menuCount =
    (restaurant.menus?.length || 0) + (restaurant.courses?.length || 0);

  return (
    <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
      <div className='flex flex-col md:flex-row'>
        {/* Restaurant Image */}
        {mainImage && (
          <div className='w-full md:w-1/3 aspect-video md:aspect-square overflow-hidden'>
            <img
              src={mainImage.url}
              alt={mainImage.alt || restaurant.name}
              className='w-full h-full object-cover'
            />
          </div>
        )}
      </div>
      {/* Restaurant Content */}
      <div className='flex-1 p-6'>
        <div className='flex justify-between items-start mb-4'>
          <div className='flex-1'>
            <h3 className='text-xl font-semibold mb-2'>{restaurant.name}</h3>
            <div className='flex items-center gap-2 mb-2'>
              <Badge variant={restaurant.isOpen ? 'default' : 'secondary'}>
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </Badge>
              {restaurant.genre && (
                <Badge variant='outline'>{restaurant.genre}</Badge>
              )}
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onEdit(restaurant)}
            className='ml-2'
          >
            <Edit className='w-4 h-4' />
          </Button>
        </div>

        {restaurant.slogan && (
          <p className='text-gray-600 italic text-sm mb-4'>
            "{restaurant.slogan}"
          </p>
        )}

        <div className='space-y-4'>
          {/* Basic Info */}
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <MapPin className='w-4 h-4' />
              <span>{restaurant.place}</span>
            </div>
            {restaurant.budget && (
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <span className='font-medium'>Budget:</span>
                <span>{restaurant.budget}</span>
              </div>
            )}
            {restaurant.capacity && (
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <Users className='w-4 h-4' />
                <span>Capacity: {restaurant.capacity} people</span>
              </div>
            )}
          </div>

          {/* Description */}
          {restaurant.description && (
            <p className='text-sm text-gray-600 line-clamp-2'>
              {restaurant.description}
            </p>
          )}

          {/* Quick Stats */}
          <div className='grid grid-cols-2 gap-4 pt-2 border-t'>
            <div className='text-center'>
              <div className='text-lg font-semibold text-blue-600'>
                {menuCount}
              </div>
              <div className='text-xs text-gray-600'>Menu Items</div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold text-green-600'>0</div>
              <div className='text-xs text-gray-600'>Reviews</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='grid grid-cols-2 gap-2 pt-2'>
            <Link
              href={`/owner-dashboard/restaurant-images?restaurant=${restaurant.id}`}
            >
              <Button variant='outline' size='sm' className='w-full'>
                <ImageIcon className='w-4 h-4 mr-1' />
                Images
              </Button>
            </Link>
            <Link href={`/owner-dashboard/menus?restaurant=${restaurant.id}`}>
              <Button variant='outline' size='sm' className='w-full'>
                <Utensils className='w-4 h-4 mr-1' />
                Menus
              </Button>
            </Link>
            <Link
              href={`/owner-dashboard/reservations?restaurant=${restaurant.id}`}
            >
              <Button variant='outline' size='sm' className='w-full'>
                <Calendar className='w-4 h-4 mr-1' />
                Bookings
              </Button>
            </Link>
            <Link href={`/owner-dashboard/reviews?restaurant=${restaurant.id}`}>
              <Button variant='outline' size='sm' className='w-full'>
                <MessageSquare className='w-4 h-4 mr-1' />
                Reviews
              </Button>
            </Link>
          </div>

          {/* Public View Link */}
          <div className='pt-2 border-t'>
            <Link href={`/r/${restaurant.slug}`}>
              <Button variant='ghost' size='sm' className='w-full'>
                View Public Page
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function OwnerDashboard() {
  return (
    <RoleGuard allowedRoles={['OWNER']} redirectTo='/'>
      <OwnerDashboardContent />
    </RoleGuard>
  );
}
