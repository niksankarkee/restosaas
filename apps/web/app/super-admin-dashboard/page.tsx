'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import type {
  CreateOrganizationRequest,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  CreateUserRequest,
  UpdateUserRequest,
  Organization,
  RestaurantResponse,
  UserResponse,
} from '@restosaas/types';
import {
  Plus,
  Building2,
  Utensils,
  Users,
  Edit,
  Trash2,
  Eye,
  UserPlus,
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

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}

function SuperAdminDashboardContent() {
  const { user: currentUser } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('organizations');
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false);
  const [isCreateRestaurantDialogOpen, setIsCreateRestaurantDialogOpen] =
    useState(false);
  const [isEditRestaurantDialogOpen, setIsEditRestaurantDialogOpen] =
    useState(false);
  const [isAssignOwnerDialogOpen, setIsAssignOwnerDialogOpen] = useState(false);
  const [isAssignUsersDialogOpen, setIsAssignUsersDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [orgsResponse, restaurantsResponse, usersResponse] =
        await Promise.all([
          api.get('/super-admin/organizations'),
          api.get('/super-admin/restaurants'),
          api.get('/super-admin/users'),
        ]);

      setOrganizations(orgsResponse.data.organizations || []);
      setRestaurants(restaurantsResponse.data.restaurants || []);
      setUsers(usersResponse.data.users || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async (data: CreateOrganizationRequest) => {
    try {
      const response = await api.post('/super-admin/organizations', data);
      setOrganizations((prev) => [...prev, response.data]);
      setIsCreateOrgDialogOpen(false);
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };

  const handleCreateRestaurant = async (data: CreateRestaurantRequest) => {
    try {
      let response;
      if (selectedOrganization) {
        // Create restaurant for specific organization
        response = await api.post(
          `/super-admin/organizations/${selectedOrganization.id}/restaurants`,
          data
        );
        setSelectedOrganization(null);
      } else {
        // Create restaurant for selected organization (general creation)
        if (!data.organizationId) {
          alert('Please select an organization.');
          return;
        }
        response = await api.post(
          `/super-admin/organizations/${data.organizationId}/restaurants`,
          data
        );
      }
      setRestaurants((prev) => [...prev, response.data]);
      setIsCreateRestaurantDialogOpen(false);
      // Refresh organizations to update restaurant count
      fetchData();
    } catch (error) {
      console.error('Failed to create restaurant:', error);
    }
  };

  const handleUpdateRestaurant = async (data: UpdateRestaurantRequest) => {
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

  const handleAssignOwner = async (data: { userId: string }) => {
    if (!selectedOrganization) return;

    try {
      await api.post(
        `/super-admin/organizations/${selectedOrganization.id}/assign-owner`,
        data
      );
      setIsAssignOwnerDialogOpen(false);
      setSelectedOrganization(null);
    } catch (error) {
      console.error('Failed to assign owner:', error);
    }
  };

  const handleAssignUsers = async (data: { userIds: string[] }) => {
    if (!selectedOrganization) return;

    try {
      await api.post(
        `/super-admin/organizations/${selectedOrganization.id}/assign-users`,
        data
      );
      setIsAssignUsersDialogOpen(false);
      setSelectedOrganization(null);
    } catch (error) {
      console.error('Failed to assign users:', error);
    }
  };

  const handleCreateUser = async (data: CreateUserRequest) => {
    try {
      const response = await api.post('/super-admin/users', data);
      setUsers((prev) => [...prev, response.data]);
      setIsCreateUserDialogOpen(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (data: UpdateUserRequest) => {
    if (!editingUser) return;

    try {
      const response = await api.put(
        `/super-admin/users/${editingUser.id}`,
        data
      );
      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? response.data : user))
      );
      setIsEditUserDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/super-admin/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this organization? This will also delete all associated restaurants.'
      )
    )
      return;

    try {
      await api.delete(`/super-admin/organizations/${orgId}`);
      setOrganizations((prev) => prev.filter((org) => org.id !== orgId));
      setRestaurants((prev) => prev.filter((rest) => rest.id !== orgId));
    } catch (error) {
      console.error('Failed to delete organization:', error);
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;

    try {
      await api.delete(`/super-admin/restaurants/${restaurantId}`);
      setRestaurants((prev) => prev.filter((rest) => rest.id !== restaurantId));
      // Refresh organizations to update restaurant count
      fetchData();
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

  return (
    <div className='p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Super Admin Dashboard
            </h1>
            <p className='text-gray-600 mt-2'>
              Manage organizations, restaurants, and users
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center'>
                <Building2 className='h-5 w-5 mr-2' />
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-blue-600'>
                {organizations.length}
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
                {restaurants.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center'>
                <Users className='h-5 w-5 mr-2' />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-purple-600'>
                {users.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center'>
                <UserPlus className='h-5 w-5 mr-2' />
                Owners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-orange-600'>
                {users.filter((u) => u.role === 'OWNER').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='organizations'>Organizations</TabsTrigger>
            <TabsTrigger value='restaurants'>Restaurants</TabsTrigger>
            <TabsTrigger value='users'>Users</TabsTrigger>
          </TabsList>

          <TabsContent value='organizations' className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Organizations</h2>
              <Dialog
                open={isCreateOrgDialogOpen}
                onOpenChange={setIsCreateOrgDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Organization
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                  </DialogHeader>
                  <OrganizationForm
                    onSubmit={handleCreateOrganization}
                    onCancel={() => setIsCreateOrgDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {organizations.length === 0 ? (
              <Card>
                <CardContent className='text-center py-12'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    No organizations found
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Get started by creating your first organization.
                  </p>
                  <Button onClick={() => setIsCreateOrgDialogOpen(true)}>
                    Create Organization
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {organizations.map((org) => (
                  <Card
                    key={org.id}
                    className='overflow-hidden hover:shadow-md transition-shadow cursor-pointer'
                    onClick={() =>
                      (window.location.href = `/super-admin-dashboard/organizations/${org.id}`)
                    }
                  >
                    <CardHeader>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg'>{org.name}</CardTitle>
                        <div
                          className='flex gap-1'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setSelectedOrganization(org);
                              setIsCreateRestaurantDialogOpen(true);
                            }}
                          >
                            <Plus className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setSelectedOrganization(org);
                              setIsAssignOwnerDialogOpen(true);
                            }}
                            title='Assign Owner'
                          >
                            <UserPlus className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setSelectedOrganization(org);
                              setIsAssignUsersDialogOpen(true);
                            }}
                            title='Assign Multiple Users'
                          >
                            <Users className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteOrganization(org.id)}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline'>
                          {org.subscriptionStatus}
                        </Badge>
                        <span className='text-sm text-gray-600'>
                          {org.restaurantCount} restaurants
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-gray-600'>
                        Created: {new Date(org.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='restaurants' className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>All Restaurants</h2>
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
                    organizations={organizations}
                    onSubmit={handleCreateRestaurant}
                    onCancel={() => setIsCreateRestaurantDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {restaurants.length === 0 ? (
              <Card>
                <CardContent className='text-center py-12'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    No restaurants found
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Create an organization first, then add restaurants to it.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {restaurants.map((restaurant) => (
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
                            onClick={() =>
                              handleDeleteRestaurant(restaurant.id)
                            }
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
          </TabsContent>

          <TabsContent value='users' className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>All Users</h2>
              <Dialog
                open={isCreateUserDialogOpen}
                onOpenChange={setIsCreateUserDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className='w-4 h-4 mr-2' />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <UserForm
                    onSubmit={handleCreateUser}
                    onCancel={() => setIsCreateUserDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {users.length === 0 ? (
              <Card>
                <CardContent className='text-center py-12'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    No users found
                  </h3>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {users.map((user) => (
                  <Card key={user.id} className='overflow-hidden'>
                    <CardHeader>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg'>
                          {user.displayName}
                        </CardTitle>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditUserDialogOpen(true);
                            }}
                            title='Edit User'
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteUser(user.id)}
                            title='Delete User'
                            disabled={user.id === currentUser?.id} // Prevent self-deletion
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={
                            user.role === 'SUPER_ADMIN'
                              ? 'default'
                              : user.role === 'OWNER'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-gray-600 mb-2'>{user.email}</p>
                      <p className='text-sm text-gray-500'>
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Restaurant Dialog */}
        <Dialog
          open={isCreateRestaurantDialogOpen}
          onOpenChange={setIsCreateRestaurantDialogOpen}
        >
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                Create Restaurant for {selectedOrganization?.name}
              </DialogTitle>
            </DialogHeader>
            <RestaurantForm
              organizations={organizations}
              onSubmit={handleCreateRestaurant}
              onCancel={() => {
                setIsCreateRestaurantDialogOpen(false);
                setSelectedOrganization(null);
              }}
            />
          </DialogContent>
        </Dialog>

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
              organizations={organizations}
              onSubmit={handleUpdateRestaurant}
              onCancel={() => {
                setIsEditRestaurantDialogOpen(false);
                setEditingRestaurant(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Assign Owner Dialog */}
        <Dialog
          open={isAssignOwnerDialogOpen}
          onOpenChange={setIsAssignOwnerDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Assign Owner to {selectedOrganization?.name}
              </DialogTitle>
            </DialogHeader>
            <AssignOwnerForm
              organization={selectedOrganization}
              users={users.filter((u) => u.role === 'OWNER')}
              onSubmit={handleAssignOwner}
              onCancel={() => {
                setIsAssignOwnerDialogOpen(false);
                setSelectedOrganization(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Assign Multiple Users Dialog */}
        <Dialog
          open={isAssignUsersDialogOpen}
          onOpenChange={setIsAssignUsersDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Assign Users to {selectedOrganization?.name}
              </DialogTitle>
            </DialogHeader>
            <AssignMultipleUsersForm
              organization={selectedOrganization}
              users={users}
              onSubmit={handleAssignUsers}
              onCancel={() => {
                setIsAssignUsersDialogOpen(false);
                setSelectedOrganization(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog
          open={isEditUserDialogOpen}
          onOpenChange={setIsEditUserDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <UserForm
              initialData={editingUser}
              onSubmit={handleUpdateUser}
              onCancel={() => {
                setIsEditUserDialogOpen(false);
                setEditingUser(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Organization Form Component
function OrganizationForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: CreateOrganizationRequest) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='name'>Organization Name *</Label>
        <Input
          id='name'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit'>Create Organization</Button>
      </div>
    </form>
  );
}

// Restaurant Form Component
function RestaurantForm({
  initialData,
  organizations,
  onSubmit,
  onCancel,
}: {
  initialData?: Restaurant | null;
  organizations?: Organization[];
  onSubmit: (data: CreateRestaurantRequest | UpdateRestaurantRequest) => void;
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
    organizationId: initialData?.orgId || '',
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

      {organizations && organizations.length > 0 && (
        <div>
          <Label htmlFor='organizationId'>Organization *</Label>
          <Select
            value={formData.organizationId}
            onValueChange={(value) =>
              setFormData({ ...formData, organizationId: value })
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder='Select an organization' />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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

// Assign Owner Form Component
function AssignOwnerForm({
  organization,
  users,
  onSubmit,
  onCancel,
}: {
  organization: Organization | null;
  users: User[];
  onSubmit: (data: { userId: string }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    ownerId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='ownerId'>Select Owner *</Label>
        <Select
          value={formData.ownerId}
          onValueChange={(value) =>
            setFormData({ ...formData, ownerId: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Select an owner' />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.displayName} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={!formData.ownerId}>
          Assign Owner
        </Button>
      </div>
    </form>
  );
}

// Assign Multiple Users Form Component
function AssignMultipleUsersForm({
  organization,
  users,
  onSubmit,
  onCancel,
}: {
  organization: Organization | null;
  users: User[];
  onSubmit: (data: { userIds: string[] }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    userIds: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleUserToggle = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter((id) => id !== userId)
        : [...prev.userIds, userId],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label>Select Users *</Label>
        <div className='max-h-60 overflow-y-auto border rounded-md p-2 space-y-2'>
          {users.map((user) => (
            <div key={user.id} className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id={`user-${user.id}`}
                checked={formData.userIds.includes(user.id)}
                onChange={() => handleUserToggle(user.id)}
                className='rounded'
              />
              <label htmlFor={`user-${user.id}`} className='text-sm'>
                {user.displayName} ({user.email}) - {user.role}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={formData.userIds.length === 0}>
          Assign Users ({formData.userIds.length})
        </Button>
      </div>
    </form>
  );
}

// User Form Component
function UserForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: User | null;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    displayName: initialData?.displayName || '',
    role: initialData?.role || 'CUSTOMER',
    password: '', // Only for new users
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: CreateUserRequest | UpdateUserRequest = { ...formData };
    if (initialData) {
      // For updates, don't send password if empty
      if (!submitData.password) {
        delete submitData.password;
      }
    }
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='email'>Email *</Label>
        <Input
          id='email'
          type='email'
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor='displayName'>Display Name *</Label>
        <Input
          id='displayName'
          value={formData.displayName}
          onChange={(e) =>
            setFormData({ ...formData, displayName: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor='role'>Role *</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='CUSTOMER'>Customer</SelectItem>
            <SelectItem value='OWNER'>Owner</SelectItem>
            <SelectItem value='SUPER_ADMIN'>Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor='password'>
          Password {initialData ? '(leave empty to keep current)' : '*'}
        </Label>
        <Input
          id='password'
          type='password'
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required={!initialData}
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit'>
          {initialData ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}

export default function SuperAdminDashboard() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <SuperAdminDashboardContent />
    </RoleGuard>
  );
}
