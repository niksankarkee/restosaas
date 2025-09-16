import Link from 'next/link';
import { api } from '@/lib/api';

async function getRestaurants(area?: string) {
  const { data } = await api.get('/restaurants', { params: { area } });
  return data as Array<{
    ID: string;
    Slug: string;
    Name: string;
    Place: string;
    Description?: string;
  }>;
}

export default async function Restaurants({
  searchParams,
}: {
  searchParams: { area?: string };
}) {
  const items = await getRestaurants(searchParams?.area);
  return (
    <main className='max-w-5xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Restaurants</h1>
      <ul className='grid gap-4 md:grid-cols-2'>
        {items.map((r) => (
          <li key={r.ID} className='border bg-white p-4 rounded-2xl'>
            <h2 className='text-xl font-bold'>
              <Link href={`/r/${r.Slug}`}>{r.Name}</Link>
            </h2>
            <p className='text-sm text-gray-600'>{r.Place}</p>
            <p>{r.Description ?? ''}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
