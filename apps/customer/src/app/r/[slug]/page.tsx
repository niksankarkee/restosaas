import { RestaurantDetails } from '@/components/restaurant-details';
import { RestaurantTabs } from '@/components/restaurant-tabs';

interface RestaurantPageProps {
  params: {
    slug: string;
  };
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <RestaurantDetails slug={params.slug} />
      <RestaurantTabs slug={params.slug} />
    </div>
  );
}
