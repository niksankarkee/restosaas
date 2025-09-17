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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreateOwnerForm } from '@/components/forms/create-owner-form';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { api } from '@/lib/api';

interface Owner {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    createdAt: string;
  };
  organization: {
    id: string;
    name: string;
    createdAt: string;
  };
}

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}

interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
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

function SuperAdminDashboardContent() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditOwnerDialogOpen, setIsEditOwnerDialogOpen] = useState(false);
  const [isEditRestaurantDialogOpen, setIsEditRestaurantDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOwners();
    fetchUsers();
    fetchRestaurants();
  }, [currentPage, roleFilter]);

  const fetchOwners = async () => {
    try {
      const response = await api.get('/super-admin/owners');
      setOwners(response.data.owners || []);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
      setOwners([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      if (roleFilter && roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      const response = await api.get(`/super-admin/users?${params}`);
      const data: UserListResponse = response.data;
      setUsers(data.users);
      setTotalPages(Math.ceil(data.pagination.total / data.pagination.limit));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/super-admin/restaurants');
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      setRestaurants([]);
    }
  };

  const handleOwnerCreated = (data: any) => {
    setOwners((prev) => [data, ...prev]);
    setIsCreateDialogOpen(false);
    fetchUsers(); // Refresh users list
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    if (!selectedUser) return;

    try {
      await api.put(`/super-admin/users/${selectedUser.id}`, updatedUser);
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, ...updatedUser } : user
        )
      );
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/super-admin/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleEditOwner = (owner: Owner) => {
    setSelectedOwner(owner);
    setIsEditOwnerDialogOpen(true);
  };

  const handleUpdateOwner = async (updatedData: {
    user: {
      email: string;
      displayName: string;
      role: string;
    };
    organization: {
      name: string;
    };
  }) => {
    if (!selectedOwner) return;

    try {
      // Update the user information
      await api.put(`/super-admin/users/${selectedOwner.user.id}`, {
        email: updatedData.user.email,
        displayName: updatedData.user.displayName,
        role: updatedData.user.role,
      });

      // Update the organization information
      await api.put(
        `/super-admin/organizations/${selectedOwner.organization.id}`,
        {
          name: updatedData.organization.name,
        }
      );

      // Update local state
      setOwners(
        owners.map((owner) =>
          owner.user.id === selectedOwner.user.id
            ? {
                ...owner,
                user: {
                  ...owner.user,
                  email: updatedData.user.email,
                  displayName: updatedData.user.displayName,
                  role: updatedData.user.role,
                },
                organization: {
                  ...owner.organization,
                  name: updatedData.organization.name,
                },
              }
            : owner
        )
      );
      setIsEditOwnerDialogOpen(false);
      setSelectedOwner(null);
    } catch (error) {
      console.error('Failed to update owner:', error);
    }
  };

  const handleDeleteOwner = async (ownerId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this owner? This will also delete their organization and all associated data.'
      )
    )
      return;

    try {
      await api.delete(`/super-admin/users/${ownerId}`);
      setOwners(owners.filter((owner) => owner.user.id !== ownerId));
    } catch (error) {
      console.error('Failed to delete owner:', error);
    }
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsEditRestaurantDialogOpen(true);
  };

  const handleUpdateRestaurant = async (updatedData: {
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
  }) => {
    if (!selectedRestaurant) return;

    try {
      await api.put(
        `/super-admin/restaurants/${selectedRestaurant.id}`,
        updatedData
      );

      // Update local state
      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant.id === selectedRestaurant.id
            ? { ...restaurant, ...updatedData }
            : restaurant
        )
      );
      setIsEditRestaurantDialogOpen(false);
      setSelectedRestaurant(null);
    } catch (error) {
      console.error('Failed to update restaurant:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
            <div className='grid gap-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='h-24 bg-gray-200 rounded'></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Super Admin Dashboard
          </h1>
          <p className='text-gray-600 mt-2'>
            Manage users, owners, and organizations
          </p>
        </div>

        <Tabs defaultValue='users' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='users'>User Management</TabsTrigger>
            <TabsTrigger value='owners'>Restaurant Owners</TabsTrigger>
            <TabsTrigger value='restaurants'>Restaurants</TabsTrigger>
          </TabsList>

          <TabsContent value='users' className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-gray-900'>
                User Management
              </h2>
              <div className='flex gap-2'>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className='w-40'>
                    <SelectValue placeholder='Filter by role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Roles</SelectItem>
                    <SelectItem value='SUPER_ADMIN'>Super Admin</SelectItem>
                    <SelectItem value='OWNER'>Owner</SelectItem>
                    <SelectItem value='CUSTOMER'>Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid gap-4'>
              {users.length === 0 ? (
                <Card>
                  <CardContent className='text-center py-12'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      No users found
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      No users match your current filter.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                users.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <div className='flex justify-between items-start'>
                        <div>
                          <CardTitle className='text-xl'>
                            {user.displayName}
                          </CardTitle>
                          <CardDescription>{user.email}</CardDescription>
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
                          <div className='text-sm text-gray-500'>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex justify-center gap-2 mt-4'>
                <Button
                  variant='outline'
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className='flex items-center px-4'>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant='outline'
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value='owners' className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-gray-900'>
                Restaurant Owners
              </h2>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>Create Owner</Button>
                </DialogTrigger>
                <DialogContent className='max-w-md'>
                  <DialogHeader>
                    <DialogTitle>Create New Owner</DialogTitle>
                  </DialogHeader>
                  <CreateOwnerForm onSuccess={handleOwnerCreated} />
                </DialogContent>
              </Dialog>
            </div>

            <div className='grid gap-4'>
              {!owners || owners.length === 0 ? (
                <Card>
                  <CardContent className='text-center py-12'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      No owners found
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      Get started by creating your first restaurant owner.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      Create Owner
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                owners.map((owner) => (
                  <Card key={owner.user.id}>
                    <CardHeader>
                      <div className='flex justify-between items-start'>
                        <div>
                          <CardTitle className='text-xl'>
                            {owner.user.displayName}
                          </CardTitle>
                          <CardDescription>{owner.user.email}</CardDescription>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Badge variant='secondary'>{owner.user.role}</Badge>
                          <div className='text-sm text-gray-500'>
                            Created:{' '}
                            {new Date(
                              owner.user.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            Organization
                          </h4>
                          <p className='text-gray-600'>
                            {owner.organization.name}
                          </p>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            Organization ID
                          </h4>
                          <p className='text-gray-600 text-sm font-mono'>
                            {owner.organization.id}
                          </p>
                        </div>
                      </div>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEditOwner(owner)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => handleDeleteOwner(owner.user.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value='restaurants' className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-gray-900'>
                Restaurant Management
              </h2>
            </div>

            <div className='grid gap-4'>
              {!restaurants || restaurants.length === 0 ? (
                <Card>
                  <CardContent className='text-center py-12'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      No restaurants found
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      No restaurants have been created yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                restaurants.map((restaurant) => (
                  <Card key={restaurant.id}>
                    <CardHeader>
                      <div className='flex justify-between items-start'>
                        <div>
                          <CardTitle className='text-xl'>
                            {restaurant.name}
                          </CardTitle>
                          <CardDescription>{restaurant.slogan}</CardDescription>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant={
                              restaurant.isOpen ? 'default' : 'secondary'
                            }
                          >
                            {restaurant.isOpen ? 'Open' : 'Closed'}
                          </Badge>
                          <div className='text-sm text-gray-500'>
                            {new Date(
                              restaurant.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            Location
                          </h4>
                          <p className='text-gray-600'>{restaurant.place}</p>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            Cuisine
                          </h4>
                          <p className='text-gray-600'>{restaurant.genre}</p>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            Budget
                          </h4>
                          <p className='text-gray-600'>{restaurant.budget}</p>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            Capacity
                          </h4>
                          <p className='text-gray-600'>
                            {restaurant.capacity} people
                          </p>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Owner</h4>
                          <p className='text-gray-600'>
                            {restaurant.ownerName}
                          </p>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            Organization
                          </h4>
                          <p className='text-gray-600'>{restaurant.orgName}</p>
                        </div>
                      </div>
                      {restaurant.description && (
                        <div className='mb-4'>
                          <h4 className='font-semibold text-gray-900'>
                            Description
                          </h4>
                          <div
                            className='text-gray-600 prose prose-gray max-w-none'
                            dangerouslySetInnerHTML={{
                              __html: restaurant.description,
                            }}
                          />
                        </div>
                      )}
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEditRestaurant(restaurant)}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <EditUserForm
                user={selectedUser}
                onSave={handleUpdateUser}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUser(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Owner Dialog */}
        <Dialog
          open={isEditOwnerDialogOpen}
          onOpenChange={setIsEditOwnerDialogOpen}
        >
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Edit Restaurant Owner</DialogTitle>
            </DialogHeader>
            {selectedOwner && (
              <EditOwnerForm
                owner={selectedOwner}
                onSave={handleUpdateOwner}
                onCancel={() => {
                  setIsEditOwnerDialogOpen(false);
                  setSelectedOwner(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Restaurant Dialog */}
        <Dialog
          open={isEditRestaurantDialogOpen}
          onOpenChange={setIsEditRestaurantDialogOpen}
        >
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Restaurant</DialogTitle>
            </DialogHeader>
            {selectedRestaurant && (
              <EditRestaurantForm
                restaurant={selectedRestaurant}
                onSave={handleUpdateRestaurant}
                onCancel={() => {
                  setIsEditRestaurantDialogOpen(false);
                  setSelectedRestaurant(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Edit User Form Component
function EditUserForm({
  user,
  onSave,
  onCancel,
}: {
  user: User;
  onSave: (updatedUser: Partial<User>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />
      </div>

      <div>
        <Label htmlFor='displayName'>Display Name</Label>
        <Input
          id='displayName'
          type='text'
          value={formData.displayName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, displayName: e.target.value }))
          }
          required
        />
      </div>

      <div>
        <Label htmlFor='role'>Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value: string) =>
            setFormData((prev) => ({ ...prev, role: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Select a role' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='SUPER_ADMIN'>Super Admin</SelectItem>
            <SelectItem value='OWNER'>Owner</SelectItem>
            <SelectItem value='CUSTOMER'>Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

// Edit Owner Form Component
function EditOwnerForm({
  owner,
  onSave,
  onCancel,
}: {
  owner: Owner;
  onSave: (updatedData: {
    user: {
      email: string;
      displayName: string;
      role: string;
    };
    organization: {
      name: string;
    };
  }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    user: {
      email: owner.user.email,
      displayName: owner.user.displayName,
      role: owner.user.role,
    },
    organization: {
      name: owner.organization.name,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='owner-email'>Email</Label>
        <Input
          id='owner-email'
          type='email'
          value={formData.user.email}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              user: { ...prev.user, email: e.target.value },
            }))
          }
          required
        />
      </div>

      <div>
        <Label htmlFor='owner-displayName'>Display Name</Label>
        <Input
          id='owner-displayName'
          type='text'
          value={formData.user.displayName}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              user: { ...prev.user, displayName: e.target.value },
            }))
          }
          required
        />
      </div>

      <div>
        <Label htmlFor='owner-role'>Role</Label>
        <Select
          value={formData.user.role}
          onValueChange={(value: string) =>
            setFormData((prev) => ({
              ...prev,
              user: { ...prev.user, role: value },
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Select a role' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='SUPER_ADMIN'>Super Admin</SelectItem>
            <SelectItem value='OWNER'>Owner</SelectItem>
            <SelectItem value='CUSTOMER'>Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor='organization-name'>Organization Name</Label>
        <Input
          id='organization-name'
          type='text'
          value={formData.organization.name}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              organization: { ...prev.organization, name: e.target.value },
            }))
          }
          required
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

// Edit Restaurant Form Component
function EditRestaurantForm({
  restaurant,
  onSave,
  onCancel,
}: {
  restaurant: Restaurant;
  onSave: (updatedData: {
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
  }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: restaurant.name,
    slogan: restaurant.slogan,
    place: restaurant.place,
    genre: restaurant.genre,
    budget: restaurant.budget,
    title: restaurant.title,
    description: restaurant.description,
    address: restaurant.address,
    phone: restaurant.phone,
    capacity: restaurant.capacity,
    isOpen: restaurant.isOpen,
  });
  const [description, setDescription] = useState(restaurant.description || '');
  const [isLoading, setIsLoading] = useState(false);

  const BUDGET_OPTIONS = [
    { value: '$', label: '$ - Budget Friendly' },
    { value: '$$', label: '$$ - Moderate' },
    { value: '$$$', label: '$$$ - Expensive' },
    { value: '$$$$', label: '$$$$ - Very Expensive' },
  ];

  const GENRE_OPTIONS = [
    'Italian',
    'Chinese',
    'Japanese',
    'Indian',
    'Mexican',
    'American',
    'French',
    'Thai',
    'Mediterranean',
    'Korean',
    'Vietnamese',
    'Greek',
    'Spanish',
    'German',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave({
        ...formData,
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6 max-h-[70vh] overflow-y-auto pr-2'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Information */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Basic Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='restaurant-name'>Restaurant Name *</Label>
              <Input
                id='restaurant-name'
                type='text'
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor='restaurant-slogan'>Slogan *</Label>
              <Input
                id='restaurant-slogan'
                type='text'
                value={formData.slogan}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slogan: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor='restaurant-place'>Location *</Label>
              <Input
                id='restaurant-place'
                type='text'
                value={formData.place}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, place: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor='restaurant-genre'>Cuisine Type *</Label>
              <select
                id='restaurant-genre'
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                value={formData.genre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, genre: e.target.value }))
                }
                required
              >
                <option value=''>Select cuisine type</option>
                {GENRE_OPTIONS.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor='restaurant-budget'>Budget Range *</Label>
              <select
                id='restaurant-budget'
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                value={formData.budget}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, budget: e.target.value }))
                }
                required
              >
                <option value=''>Select budget range</option>
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor='restaurant-title'>Restaurant Title *</Label>
              <Input
                id='restaurant-title'
                type='text'
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className='space-y-2'>
          <Label>Description</Label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder='Describe your restaurant, its history, specialties, and what makes it unique...'
          />
        </div>

        {/* Contact Information */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Contact Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='restaurant-address'>Address</Label>
              <Input
                id='restaurant-address'
                type='text'
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor='restaurant-phone'>Phone Number</Label>
              <Input
                id='restaurant-phone'
                type='tel'
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        {/* Capacity and Status */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Restaurant Details
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='restaurant-capacity'>Capacity *</Label>
              <Input
                id='restaurant-capacity'
                type='number'
                min='1'
                value={formData.capacity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    capacity: parseInt(e.target.value) || 1,
                  }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor='restaurant-status'>Status</Label>
              <Select
                value={formData.isOpen ? 'open' : 'closed'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, isOpen: value === 'open' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='open'>Open</SelectItem>
                  <SelectItem value='closed'>Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-2 pt-4 border-t'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function SuperAdminDashboard() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <SuperAdminDashboardContent />
    </RoleGuard>
  );
}
