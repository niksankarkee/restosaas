import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import { useQuery } from '@tanstack/react-query';
import { api as apiClient } from '../../lib/api-client';
import { Users, Building2, Utensils, TrendingUp } from 'lucide-react';
import type { UserResponse, Organization } from '@restosaas/types';

export function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.getUsers(),
  });

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: () => apiClient.getOrganizations(),
  });

  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: () => apiClient.getAllRestaurants(),
  });

  if (usersLoading || orgsLoading || restaurantsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Super Admin Dashboard
        </h1>
        <p className='text-gray-600'>
          Manage users, organizations, and restaurants
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {users?.data?.pagination?.total || 0}
            </div>
            <p className='text-xs text-muted-foreground'>Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Organizations</CardTitle>
            <Building2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {organizations?.data?.organizations?.length || 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              Active organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Restaurants</CardTitle>
            <Utensils className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {restaurants?.data?.restaurants?.length || 0}
            </div>
            <p className='text-xs text-muted-foreground'>Total restaurants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Growth</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>+12%</div>
            <p className='text-xs text-muted-foreground'>This month</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users?.data?.users && users.data.users.length > 0 ? (
              <div className='space-y-2'>
                {users.data.users.slice(0, 5).map((user: UserResponse) => (
                  <div
                    key={user.id}
                    className='flex justify-between items-center p-2 border rounded'
                  >
                    <div>
                      <p className='font-medium'>{user.displayName}</p>
                      <p className='text-sm text-gray-500'>{user.email}</p>
                    </div>
                    <span className='text-sm px-2 py-1 rounded bg-blue-100 text-blue-800'>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500'>No users yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            {organizations?.data?.organizations &&
            organizations.data.organizations.length > 0 ? (
              <div className='space-y-2'>
                {organizations.data.organizations
                  .slice(0, 5)
                  .map((org: Organization) => (
                    <div
                      key={org.id}
                      className='flex justify-between items-center p-2 border rounded'
                    >
                      <div>
                        <p className='font-medium'>{org.name}</p>
                        <p className='text-sm text-gray-500'>
                          {org.restaurantCount} restaurants
                        </p>
                      </div>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          org.subscriptionStatus === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {org.subscriptionStatus}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className='text-gray-500'>No organizations yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
