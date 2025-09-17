'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { RoleGuard } from '@/components/auth/role-guard';
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Building2,
  Utensils,
  Users,
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  subscriptionStatus: string;
  createdAt: string;
  restaurantCount: number;
}

interface Restaurant {
  id: string;
  slug: string;
  name: string;
  slogan: string;
  place: string;
  genre: string;
  budget: string;
  title: string;
  description: string;
  address: string;
  phone: string;
  capacity: number;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
  orgId: string;
  orgName: string;
  ownerName: string;
  ownerEmail: string;
}

interface OrgMember {
  id: string;
  userId: string;
  orgId: string;
  role: string;
  displayName: string;
  email: string;
  createdAt: string;
}

function OrganizationDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateRestaurantDialogOpen, setIsCreateRestaurantDialogOpen] =
    useState(false);
  const [isEditRestaurantDialogOpen, setIsEditRestaurantDialogOpen] =
    useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );

  const organizationId = params.id as string;

  useEffect(() => {
    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [orgResponse, restaurantsResponse, membersResponse] =
        await Promise.all([
          api.get(`/super-admin/organizations/${organizationId}`),
          api.get(`/super-admin/restaurants`),
          api.get(`/super-admin/organizations/${organizationId}/members`),
        ]);

      setOrganization(orgResponse.data);
      setRestaurants(restaurantsResponse.data.restaurants || []);
      setMembers(membersResponse.data.members || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRestaurant = async (data: any) => {
    try {
      const response = await api.post(
        `/super-admin/organizations/${organizationId}/restaurants`,
        data
      );
      setRestaurants((prev) => [...prev, response.data]);
      setIsCreateRestaurantDialogOpen(false);
      // Update restaurant count
      if (organization) {
        setOrganization((prev) =>
          prev ? { ...prev, restaurantCount: prev.restaurantCount + 1 } : null
        );
      }
    } catch (error) {
      console.error('Failed to create restaurant:', error);
    }
  };

  const handleUpdateRestaurant = async (data: any) => {
    if (!editingRestaurant) return;

    try {
      const response = await api.put(
        `/super-admin/restaurants/${editingRestaurant.id}`,
        data
      );
      setRestaurants((prev) =>
        prev.map((rest) =>
          rest.id === editingRestaurant.id ? response.data : rest
        )
      );
      setIsEditRestaurantDialogOpen(false);
      setEditingRestaurant(null);
    } catch (error) {
      console.error('Failed to update restaurant:', error);
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;

    try {
      await api.delete(`/super-admin/restaurants/${restaurantId}`);
      setRestaurants((prev) => prev.filter((rest) => rest.id !== restaurantId));
      // Update restaurant count
      if (organization) {
        setOrganization((prev) =>
          prev ? { ...prev, restaurantCount: prev.restaurantCount - 1 } : null
        );
      }
    } catch (error) {
      console.error('Failed to delete restaurant:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
            <div className='h-64 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <Card>
            <CardContent className='text-center py-12'>
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                Organization Not Found
              </h1>
              <p className='text-gray-600 mb-4'>
                The organization you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/super-admin-dashboard')}>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Filter restaurants for this organization
  const orgRestaurants = restaurants.filter(
    (rest) => rest.orgId === organizationId
  );

  return (
    <div className='p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='outline'
              onClick={() => router.push('/super-admin-dashboard')}
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Dashboard
            </Button>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                {organization.name}
              </h1>
              <p className='text-gray-600 mt-2'>Organization Management</p>
            </div>
          </div>
        </div>

        {/* Organization Info */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center'>
                <Building2 className='h-5 w-5 mr-2' />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-blue-600'>
                {organization.name}
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                Status: {organization.subscriptionStatus}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center'>
                <Utensils className='h-5 w-5 mr-2' />
                Restaurants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-green-600'>
                {orgRestaurants.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center'>
                <Users className='h-5 w-5 mr-2' />
                Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-purple-600'>
                {members.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants Section */}
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Restaurants</h2>
            <Dialog
              open={isCreateRestaurantDialogOpen}
              onOpenChange={setIsCreateRestaurantDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className='w-4 h-4 mr-2' />
                  Create Restaurant
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>Create New Restaurant</DialogTitle>
                </DialogHeader>
                <RestaurantForm
                  onSubmit={handleCreateRestaurant}
                  onCancel={() => setIsCreateRestaurantDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {orgRestaurants.length === 0 ? (
            <Card>
              <CardContent className='text-center py-12'>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  No restaurants found
                </h3>
                <p className='text-gray-600 mb-4'>
                  Get started by creating your first restaurant for this
                  organization.
                </p>
                <Button onClick={() => setIsCreateRestaurantDialogOpen(true)}>
                  Create Restaurant
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {orgRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className='overflow-hidden'>
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <CardTitle className='text-lg'>
                        {restaurant.name}
                      </CardTitle>
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setEditingRestaurant(restaurant);
                            setIsEditRestaurantDialogOpen(true);
                          }}
                          title='Edit Restaurant'
                        >
                          <Edit className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteRestaurant(restaurant.id)}
                          title='Delete Restaurant'
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant={restaurant.isOpen ? 'default' : 'secondary'}
                      >
                        {restaurant.isOpen ? 'Open' : 'Closed'}
                      </Badge>
                      <Badge variant='outline'>{restaurant.genre}</Badge>
                      <span className='text-sm text-gray-600'>
                        {restaurant.place}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-gray-600 mb-2'>
                      {restaurant.slogan}
                    </p>
                    <p className='text-sm text-gray-500'>
                      Capacity: {restaurant.capacity} people
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Members Section */}
        <div className='mt-8 space-y-6'>
          <h2 className='text-xl font-semibold'>Organization Members</h2>
          {members.length === 0 ? (
            <Card>
              <CardContent className='text-center py-12'>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  No members found
                </h3>
                <p className='text-gray-600'>
                  This organization has no assigned members.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {members.map((member) => (
                <Card key={member.id} className='overflow-hidden'>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      {member.displayName}
                    </CardTitle>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant={
                          member.role === 'SUPER_ADMIN'
                            ? 'default'
                            : member.role === 'OWNER'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {member.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-gray-600 mb-2'>{member.email}</p>
                    <p className='text-sm text-gray-500'>
                      Joined: {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Edit Restaurant Dialog */}
        <Dialog
          open={isEditRestaurantDialogOpen}
          onOpenChange={setIsEditRestaurantDialogOpen}
        >
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Restaurant</DialogTitle>
            </DialogHeader>
            <RestaurantForm
              initialData={editingRestaurant}
              onSubmit={handleUpdateRestaurant}
              onCancel={() => {
                setIsEditRestaurantDialogOpen(false);
                setEditingRestaurant(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Restaurant Form Component (reused from super admin dashboard)
function RestaurantForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Restaurant | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slogan: initialData?.slogan || '',
    place: initialData?.place || '',
    genre: initialData?.genre || '',
    budget: initialData?.budget || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    capacity: initialData?.capacity || 30,
    isOpen: initialData?.isOpen ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='name'>Restaurant Name *</Label>
          <Input
            id='name'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor='slogan'>Slogan *</Label>
          <Input
            id='slogan'
            value={formData.slogan}
            onChange={(e) =>
              setFormData({ ...formData, slogan: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='place'>Place *</Label>
          <Input
            id='place'
            value={formData.place}
            onChange={(e) =>
              setFormData({ ...formData, place: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor='genre'>Cuisine Genre *</Label>
          <Input
            id='genre'
            value={formData.genre}
            onChange={(e) =>
              setFormData({ ...formData, genre: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='budget'>Budget Range *</Label>
          <Input
            id='budget'
            value={formData.budget}
            onChange={(e) =>
              setFormData({ ...formData, budget: e.target.value })
            }
            placeholder='e.g., 500-1500'
            required
          />
        </div>
        <div>
          <Label htmlFor='title'>Restaurant Title *</Label>
          <Input
            id='title'
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor='description'>Description</Label>
        <Textarea
          id='description'
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='address'>Address</Label>
          <Input
            id='address'
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor='phone'>Phone</Label>
          <Input
            id='phone'
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='capacity'>Capacity *</Label>
          <Input
            id='capacity'
            type='number'
            value={formData.capacity}
            onChange={(e) =>
              setFormData({
                ...formData,
                capacity: parseInt(e.target.value) || 30,
              })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor='isOpen'>Status</Label>
          <Select
            value={formData.isOpen ? 'open' : 'closed'}
            onValueChange={(value) =>
              setFormData({ ...formData, isOpen: value === 'open' })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='open'>Open</SelectItem>
              <SelectItem value='closed'>Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit'>
          {initialData ? 'Update Restaurant' : 'Create Restaurant'}
        </Button>
      </div>
    </form>
  );
}

export default function OrganizationDetailPage() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <OrganizationDetailContent />
    </RoleGuard>
  );
}
