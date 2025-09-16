import { api } from '@/lib/api';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';

async function getLanding() {
  try {
    const { data } = await api.get(`/landing/home`);
    return data as { title: string; bodyMD: string };
  } catch {
    return { title: 'RestoSaaS', bodyMD: '<p>Welcome!</p>' };
  }
}

export default async function Home() {
  const page = await getLanding();
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* <Navbar /> */}
      <main className='max-w-5xl mx-auto p-6 space-y-6'>
        <header className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>{page.title}</h1>
          <Link href='/restaurants' className='underline'>
            Browse restaurants
          </Link>
        </header>
        <article
          className='prose'
          dangerouslySetInnerHTML={{ __html: page.bodyMD }}
        />
      </main>
    </div>
  );
}
