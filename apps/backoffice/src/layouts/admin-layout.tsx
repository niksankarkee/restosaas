import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';

export function AdminLayout() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='lg:pl-64'>
        <Header />
        <main className='py-6'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
