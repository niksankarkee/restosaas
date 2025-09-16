'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { OrganizationForm } from '@/components/forms/organization-form';
import { api } from '@/lib/api';

interface Organization {
  id: string;
  name: string;
  createdAt: string;
  members?: OrganizationMember[];
}

interface OrganizationMember {
  id: string;
  userId: string;
  role: string;
  displayName: string;
  email: string;
}

function OrganizationDashboardContent() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }
      const response = await api.get('/organizations/me');
      setOrganization(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setOrganization(null); // No organization found for this user
      } else if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        router.push('/');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch organization');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = (data: any) => {
    setOrganization(data);
  };

  const handleEditSuccess = (data: any) => {
    setOrganization(data);
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
              Organization Dashboard
            </h1>
            <p className='text-gray-600 mt-2'>
              Manage your organization details and members
            </p>
          </div>
          {organization && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline'>Edit Organization</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Organization</DialogTitle>
                </DialogHeader>
                <OrganizationForm
                  initialData={{
                    id: organization.id,
                    name: organization.name,
                  }}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setIsEditDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {error && (
          <Card className='mb-6 border-red-200 bg-red-50'>
            <CardContent className='p-4'>
              <p className='text-red-600'>{error}</p>
            </CardContent>
          </Card>
        )}

        {!organization ? (
          <Card>
            <CardHeader>
              <CardTitle>No Organization Found</CardTitle>
              <CardDescription>
                You don't have an organization yet. Create one to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationForm onSuccess={handleCreateSuccess} />
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Name</h3>
                    <p className='text-gray-600'>{organization.name}</p>
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Created</h3>
                    <p className='text-gray-600'>
                      {new Date(organization.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Members ({organization.members?.length || 0} member
                  {(organization.members?.length || 0) !== 1 ? 's' : ''})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!organization.members || organization.members.length === 0 ? (
                  <p className='text-gray-600 text-center py-4'>
                    No members found
                  </p>
                ) : (
                  <div className='space-y-4'>
                    {organization.members.map((member) => (
                      <div
                        key={member.id}
                        className='flex justify-between items-center p-4 border rounded-lg'
                      >
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            {member.displayName}
                          </h4>
                          <p className='text-gray-600'>{member.email}</p>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span className='px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full'>
                            {member.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrganizationDashboard() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <OrganizationDashboardContent />
    </RoleGuard>
  );
}
