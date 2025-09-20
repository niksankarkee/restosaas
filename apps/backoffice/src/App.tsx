import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth-store';
import { OwnerLayout } from './layouts/owner-layout';
import { AdminLayout } from './layouts/admin-layout';
import { OwnerDashboard } from './pages/owner/dashboard';
import { OwnerRestaurants } from './pages/owner/restaurants';
import { OwnerMenus } from './pages/owner/menus';
import { OwnerGallery } from './pages/owner/gallery';
import { OwnerReservations } from './pages/owner/reservations';
import { OwnerReviews } from './pages/owner/reviews';
import { AdminDashboard } from './pages/admin/dashboard';
import { AdminUsers } from './pages/admin/users';
import { AdminOrganizations } from './pages/admin/organizations';
import { AdminRestaurants } from './pages/admin/restaurants';
import { LoadingSpinner } from './components/loading-spinner';
import { LoginPage } from './pages/auth/login-page';
import { SignupPage } from './pages/auth/signup-page';

function App() {
  const { user, isLoading, checkAuth } = useAuthStore();

  // Check authentication on mount
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    );
  }

  // Get user role
  const role = user.role;

  return (
    <Routes>
      {role === 'OWNER' && (
        <Route path='/owner' element={<OwnerLayout />}>
          <Route index element={<Navigate to='/owner/dashboard' replace />} />
          <Route path='dashboard' element={<OwnerDashboard />} />
          <Route path='restaurants' element={<OwnerRestaurants />} />
          <Route path='menus' element={<OwnerMenus />} />
          <Route path='gallery' element={<OwnerGallery />} />
          <Route path='reservations' element={<OwnerReservations />} />
          <Route path='reviews' element={<OwnerReviews />} />
        </Route>
      )}

      {role === 'SUPER_ADMIN' && (
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<Navigate to='/admin/dashboard' replace />} />
          <Route path='dashboard' element={<AdminDashboard />} />
          <Route path='users' element={<AdminUsers />} />
          <Route path='organizations' element={<AdminOrganizations />} />
          <Route path='restaurants' element={<AdminRestaurants />} />
        </Route>
      )}

      <Route
        path='*'
        element={
          <Navigate to={role === 'OWNER' ? '/owner' : '/admin'} replace />
        }
      />
    </Routes>
  );
}

export default App;
