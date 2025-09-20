import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@restosaas/ui';
import { Input } from '@restosaas/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/dialog';
import { api as apiClient } from '../../lib/api-client';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import type { Organization } from '@restosaas/types';

export function AdminOrganizations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: () => apiClient.getOrganizations(),
  });

  const createOrgMutation = useMutation({
    mutationFn: (data: { name: string }) => apiClient.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      setIsCreateDialogOpen(false);
    },
  });

  const updateOrgMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      apiClient.updateOrganization(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      setIsEditDialogOpen(false);
      setEditingOrg(null);
    },
  });

  const deleteOrgMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
    },
  });

  const filteredOrgs =
    organizations?.data?.organizations?.filter((org: Organization) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Organizations</h1>
          <p className='text-gray-600'>
            Manage organizations and their members
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='w-4 h-4 mr-2' />
          Add Organization
        </Button>
      </div>

      <div className='flex items-center space-x-2'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            placeholder='Search organizations...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredOrgs.map((org: Organization) => (
          <Card key={org.id}>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-lg'>{org.name}</CardTitle>
                  <p className='text-sm text-gray-500'>
                    {org.restaurantCount} restaurants
                  </p>
                </div>
                <div className='flex space-x-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setEditingOrg(org);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className='w-4 h-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to delete this organization?'
                        )
                      ) {
                        deleteOrgMutation.mutate(org.id);
                      }
                    }}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Status:</span>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    org.subscriptionStatus === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : org.subscriptionStatus === 'SUSPENDED'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {org.subscriptionStatus}
                </span>
              </div>
              <div className='flex items-center justify-between mt-2'>
                <span className='text-sm text-gray-500'>Created:</span>
                <span className='text-sm text-gray-600'>
                  {new Date(org.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className='mt-4'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full'
                  onClick={() => {
                    // TODO: Navigate to organization members page
                    console.log('View members for org:', org.id);
                  }}
                >
                  <Users className='w-4 h-4 mr-2' />
                  View Members
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrgs.length === 0 && (
        <Card>
          <CardContent className='text-center py-12'>
            <p className='text-gray-500'>No organizations found</p>
          </CardContent>
        </Card>
      )}

      {/* Create Organization Dialog */}
      {isCreateDialogOpen && (
        <CreateOrgDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={(data) => createOrgMutation.mutate(data)}
          isLoading={createOrgMutation.isPending}
        />
      )}

      {/* Edit Organization Dialog */}
      {isEditDialogOpen && editingOrg && (
        <EditOrgDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingOrg(null);
          }}
          organization={editingOrg}
          onSubmit={(data) =>
            updateOrgMutation.mutate({ id: editingOrg.id, data })
          }
          isLoading={updateOrgMutation.isPending}
        />
      )}
    </div>
  );
}

// Create Organization Dialog Component
function CreateOrgDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Organization Name
              </label>
              <Input
                type='text'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className='flex justify-end space-x-2'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}

// Edit Organization Dialog Component
function EditOrgDialog({
  isOpen,
  onClose,
  organization,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
  onSubmit: (data: { name: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: organization.name,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
        </DialogHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Organization Name
              </label>
              <Input
                type='text'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className='flex justify-end space-x-2'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Organization'}
              </Button>
            </div>
          </form>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
