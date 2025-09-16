'use client';

import { Navbar } from '@/components/navbar';

interface CommonLayoutProps {
  children: React.ReactNode;
}

export function CommonLayout({ children }: CommonLayoutProps) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
