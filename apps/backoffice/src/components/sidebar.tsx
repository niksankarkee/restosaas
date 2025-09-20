import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';
import {
  LayoutDashboard,
  Building2,
  Utensils,
  Calendar,
  MessageSquare,
  Users,
  Camera,
} from 'lucide-react';

const ownerNavItems = [
  { name: 'Dashboard', href: '/owner/dashboard', icon: LayoutDashboard },
  { name: 'Restaurants', href: '/owner/restaurants', icon: Building2 },
  { name: 'Menus', href: '/owner/menus', icon: Utensils },
  { name: 'Gallery', href: '/owner/gallery', icon: Camera },
  { name: 'Reservations', href: '/owner/reservations', icon: Calendar },
  { name: 'Reviews', href: '/owner/reviews', icon: MessageSquare },
];

const adminNavItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { name: 'Restaurants', href: '/admin/restaurants', icon: Utensils },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const navItems = user?.role === 'OWNER' ? ownerNavItems : adminNavItems;

  return (
    <div className='hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col'>
      <div className='flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm'>
        <div className='flex h-16 shrink-0 items-center'>
          <h1 className='text-xl font-bold text-gray-900'>RestoSaaS</h1>
        </div>
        <nav className='flex flex-1 flex-col'>
          <ul role='list' className='flex flex-1 flex-col gap-y-7'>
            <li>
              <ul role='list' className='-mx-2 space-y-1'>
                {navItems.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`
                      }
                    >
                      <item.icon className='h-6 w-6 shrink-0' />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
