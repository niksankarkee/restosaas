'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { EnhancedSelect } from '@/components/ui/enhanced-select';
import { EnhancedDatePicker } from '@/components/ui/enhanced-datepicker';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  MapPin,
  Clock,
  Users,
  Utensils,
  Star,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { APP_TEXT, THEME_COLORS } from '@/lib/constants';

const CUISINE_OPTIONS = [
  { value: '', label: APP_TEXT.SEARCH.ANY_CUISINE },
  ...APP_TEXT.CUISINE_TYPES.map((cuisine) => ({
    value: cuisine,
    label: cuisine,
  })),
];

const BUDGET_OPTIONS = APP_TEXT.BUDGET_OPTIONS;

const TIME_OPTIONS = APP_TEXT.TIME_OPTIONS.map((time) => ({
  value: time,
  label: time,
}));

export default function Home() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    area: '',
    cuisine: '',
    date: '',
    time: '',
    people: '2',
    budget: 'all',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    setErrors({});

    try {
      const params = new URLSearchParams();

      // Add parameters only if they have meaningful values
      if (searchParams.area?.trim())
        params.append('area', searchParams.area.trim());
      if (searchParams.cuisine?.trim())
        params.append('cuisine', searchParams.cuisine.trim());
      if (searchParams.date) params.append('date', searchParams.date);
      if (searchParams.time && searchParams.time !== 'Any Time')
        params.append('time', searchParams.time);
      if (searchParams.people && searchParams.people !== '2')
        params.append('people', searchParams.people);
      if (searchParams.budget && searchParams.budget !== 'all') {
        // URL encode the budget parameter to handle $ characters
        params.append('budget', encodeURIComponent(searchParams.budget));
      }

      const queryString = params.toString();
      router.push(`/restaurants${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      setErrors({
        general: 'An error occurred while searching. Please try again.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Banner Section */}
      <div className='relative h-[70vh] w-full overflow-hidden'>
        {/* Background Image */}
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage:
              'url(https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg)',
          }}
        >
          {/* Overlay */}
          <div className='absolute inset-0 bg-black bg-opacity-40' />
        </div>

        {/* Content */}
        <div className='relative z-10 flex h-full items-center justify-center'>
          <div className='text-center text-white'>
            <h1 className='mb-4 text-5xl font-bold md:text-6xl'>
              {APP_TEXT.LANDING.HERO_TITLE}
              <span className='block restaurant-gradient-text'>
                {APP_TEXT.LANDING.HERO_SUBTITLE}
              </span>
            </h1>
            <p className='mb-8 text-xl md:text-2xl'>
              {APP_TEXT.LANDING.HERO_DESCRIPTION}
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className='relative z-20 -mt-20 px-4'>
        <div className='mx-auto max-w-6xl'>
          <Card className='enhanced-card shadow-2xl'>
            <CardContent className='p-8'>
              <div className='mb-6 text-center'>
                <h2 className='mb-2 text-3xl font-bold text-gray-900'>
                  {APP_TEXT.LANDING.SEARCH_TITLE}
                </h2>
                <p className='text-gray-600'>
                  {APP_TEXT.LANDING.SEARCH_DESCRIPTION}
                </p>
              </div>

              {errors.general && (
                <div className='mb-4 rounded-lg bg-error/10 border border-error/20 p-3'>
                  <p className='text-sm text-error'>{errors.general}</p>
                </div>
              )}

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
                {/* Area/Location */}
                <EnhancedInput
                  label={APP_TEXT.SEARCH.AREA}
                  placeholder={APP_TEXT.SEARCH.AREA_PLACEHOLDER}
                  value={searchParams.area}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      area: e.target.value,
                    }))
                  }
                  leftIcon={<MapPin className='h-4 w-4' />}
                  error={errors.area}
                />

                {/* Cuisine Type - Now a text input */}
                <EnhancedInput
                  label={APP_TEXT.SEARCH.CUISINE}
                  placeholder={APP_TEXT.SEARCH.CUISINE_PLACEHOLDER}
                  value={searchParams.cuisine}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      cuisine: e.target.value,
                    }))
                  }
                  leftIcon={<Utensils className='h-4 w-4' />}
                  error={errors.cuisine}
                />

                {/* Date */}
                <EnhancedDatePicker
                  label={APP_TEXT.SEARCH.DATE}
                  placeholder={APP_TEXT.SEARCH.DATE_PLACEHOLDER}
                  value={searchParams.date ? new Date(searchParams.date) : null}
                  onChange={(date) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      date: date ? date.toISOString().split('T')[0] : '',
                    }))
                  }
                  minDate={new Date()}
                  error={errors.date}
                />

                {/* Time */}
                <EnhancedSelect
                  label={APP_TEXT.SEARCH.TIME}
                  placeholder={APP_TEXT.SEARCH.TIME_PLACEHOLDER}
                  value={searchParams.time}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                  options={TIME_OPTIONS}
                  leftIcon={<Clock className='h-4 w-4' />}
                  error={errors.time}
                />

                {/* Number of People */}
                <EnhancedSelect
                  label={APP_TEXT.SEARCH.PEOPLE}
                  placeholder={APP_TEXT.SEARCH.PEOPLE_PLACEHOLDER}
                  value={searchParams.people}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      people: e.target.value,
                    }))
                  }
                  options={Array.from({ length: 20 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `${i + 1} ${
                      i === 0 ? APP_TEXT.COMMON.GUEST : APP_TEXT.COMMON.GUESTS
                    }`,
                  }))}
                  leftIcon={<Users className='h-4 w-4' />}
                  error={errors.people}
                />
              </div>

              {/* Budget Filter */}
              <div className='mt-6'>
                <label className='mb-3 block text-sm font-medium text-gray-700'>
                  {APP_TEXT.SEARCH.BUDGET}
                </label>
                <div className='flex flex-wrap gap-2'>
                  {BUDGET_OPTIONS.map((option) => (
                    <EnhancedButton
                      key={option.value}
                      variant={
                        searchParams.budget === option.value
                          ? 'default'
                          : 'outline'
                      }
                      size='sm'
                      onClick={() =>
                        setSearchParams((prev) => ({
                          ...prev,
                          budget: option.value,
                        }))
                      }
                    >
                      {option.label}
                    </EnhancedButton>
                  ))}
                </div>
              </div>

              {/* Search Button */}
              <div className='mt-6 text-center'>
                <EnhancedButton
                  onClick={handleSearch}
                  size='lg'
                  loading={isSearching}
                  leftIcon={<Search className='h-5 w-5' />}
                  className='px-8 py-3 text-lg'
                >
                  {APP_TEXT.SEARCH.SEARCH_BUTTON}
                </EnhancedButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className='py-16 bg-neutral-50'>
        <div className='mx-auto max-w-6xl px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              {APP_TEXT.LANDING.FEATURES_TITLE}
            </h2>
            <p className='text-lg text-gray-600'>
              {APP_TEXT.LANDING.FEATURES_DESCRIPTION}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Feature 1 */}
            <Card className='enhanced-card text-center p-6'>
              <CardContent className='p-0'>
                <div className='w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center'>
                  <Search className='h-8 w-8 text-primary' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  {APP_TEXT.LANDING.FEATURE_1_TITLE}
                </h3>
                <p className='text-gray-600'>
                  {APP_TEXT.LANDING.FEATURE_1_DESCRIPTION}
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className='enhanced-card text-center p-6'>
              <CardContent className='p-0'>
                <div className='w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center'>
                  <Zap className='h-8 w-8 text-secondary' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  {APP_TEXT.LANDING.FEATURE_2_TITLE}
                </h3>
                <p className='text-gray-600'>
                  {APP_TEXT.LANDING.FEATURE_2_DESCRIPTION}
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className='enhanced-card text-center p-6'>
              <CardContent className='p-0'>
                <div className='w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center'>
                  <Star className='h-8 w-8 text-accent' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  {APP_TEXT.LANDING.FEATURE_3_TITLE}
                </h3>
                <p className='text-gray-600'>
                  {APP_TEXT.LANDING.FEATURE_3_DESCRIPTION}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='py-16 bg-gradient-to-r from-primary to-secondary'>
        <div className='mx-auto max-w-4xl text-center px-4'>
          <h2 className='text-3xl font-bold text-white mb-4'>
            Ready to Find Your Perfect Restaurant?
          </h2>
          <p className='text-xl text-white/90 mb-8'>
            Join thousands of food lovers who have discovered their favorite
            dining spots with us.
          </p>
          <EnhancedButton
            onClick={() => router.push('/restaurants')}
            size='lg'
            variant='secondary'
            className='px-8 py-3 text-lg'
            leftIcon={<CheckCircle className='h-5 w-5' />}
          >
            Browse All Restaurants
          </EnhancedButton>
        </div>
      </div>
    </div>
  );
}
