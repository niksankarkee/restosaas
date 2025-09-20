import { RestaurantGrid } from '@/components/restaurant-grid';
import { SearchFilters } from '@/components/search-filters';

export default function RestaurantsPage() {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Restaurants</h1>
        <p className='text-gray-600'>
          Discover amazing restaurants in your area
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
        <div className='lg:col-span-1'>
          <SearchFilters />
        </div>
        <div className='lg:col-span-3'>
          <RestaurantGrid />
        </div>
      </div>
    </div>
  );
}
