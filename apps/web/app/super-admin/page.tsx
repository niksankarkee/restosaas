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

function SuperAdminDashboardContent() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOwners();
    fetchUsers();
  }, [currentPage, roleFilter]);

  const fetchOwners = async () => {
    try {
      const response = await api.get('/super-admin/owners');
      setOwners(response.data);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
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
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='users'>User Management</TabsTrigger>
            <TabsTrigger value='owners'>Restaurant Owners</TabsTrigger>
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
              {owners.length === 0 ? (
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
                        <div className='text-sm text-gray-500'>
                          Created:{' '}
                          {new Date(owner.user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            Organization
                          </h4>
                          <p className='text-gray-600'>
                            {owner.organization.name}
                          </p>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Role</h4>
                          <p className='text-gray-600'>{owner.user.role}</p>
                        </div>
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

export default function SuperAdminDashboard() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <SuperAdminDashboardContent />
    </RoleGuard>
  );
}
