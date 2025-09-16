'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Clock, Users, Utensils } from 'lucide-react';

const CUISINE_OPTIONS = [
  'All Cuisines',
  'Italian',
  'Chinese',
  'Japanese',
  'Indian',
  'Mexican',
  'American',
  'French',
  'Thai',
  'Mediterranean',
  'Korean',
  'Vietnamese',
  'Greek',
  'Spanish',
  'German',
];

const BUDGET_OPTIONS = [
  { value: 'all', label: 'Any Budget' },
  { value: '$', label: '$ - Budget Friendly' },
  { value: '$$', label: '$$ - Moderate' },
  { value: '$$$', label: '$$$ - Expensive' },
  { value: '$$$$', label: '$$$$ - Very Expensive' },
];

const TIME_OPTIONS = [
  'Any Time',
  '6:00 AM',
  '7:00 AM',
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
  '10:00 PM',
  '11:00 PM',
];

export default function Home() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    area: '',
    cuisine: 'All Cuisines',
    date: '',
    time: 'Any Time',
    people: '2',
    budget: 'all',
  });

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchParams.area) params.append('area', searchParams.area);
    if (searchParams.cuisine && searchParams.cuisine !== 'All Cuisines') {
      params.append('cuisine', searchParams.cuisine);
    }
    if (searchParams.date) params.append('date', searchParams.date);
    if (searchParams.time && searchParams.time !== 'Any Time') {
      params.append('time', searchParams.time);
    }
    if (searchParams.people) params.append('people', searchParams.people);
    if (searchParams.budget && searchParams.budget !== 'all') {
      params.append('budget', searchParams.budget);
    }

    const queryString = params.toString();
    router.push(`/restaurants${queryString ? `?${queryString}` : ''}`);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
              Find Your Perfect
              <span className='block text-yellow-400'>Dining Experience</span>
            </h1>
            <p className='mb-8 text-xl md:text-2xl'>
              Discover amazing restaurants, make reservations, and enjoy great
              food
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className='relative z-20 -mt-20 px-4'>
        <div className='mx-auto max-w-6xl'>
          <Card className='shadow-2xl'>
            <CardContent className='p-8'>
              <div className='mb-6 text-center'>
                <h2 className='mb-2 text-3xl font-bold text-gray-900'>
                  Search Restaurants
                </h2>
                <p className='text-gray-600'>
                  Find the perfect restaurant for your next meal
                </p>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
                {/* Area/Location */}
                <div className='space-y-2'>
                  <Label htmlFor='area' className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    Area
                  </Label>
                  <Input
                    id='area'
                    placeholder='Enter area or city'
                    value={searchParams.area}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        area: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Cuisine Type */}
                <div className='space-y-2'>
                  <Label htmlFor='cuisine' className='flex items-center gap-2'>
                    <Utensils className='h-4 w-4' />
                    Cuisine
                  </Label>
                  <Select
                    value={searchParams.cuisine}
                    onValueChange={(value) =>
                      setSearchParams((prev) => ({ ...prev, cuisine: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select cuisine' />
                    </SelectTrigger>
                    <SelectContent>
                      {CUISINE_OPTIONS.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine}>
                          {cuisine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className='space-y-2'>
                  <Label htmlFor='date' className='flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    Date
                  </Label>
                  <Input
                    id='date'
                    type='date'
                    min={getTodayDate()}
                    value={searchParams.date}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Time */}
                <div className='space-y-2'>
                  <Label htmlFor='time' className='flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    Time
                  </Label>
                  <Select
                    value={searchParams.time}
                    onValueChange={(value) =>
                      setSearchParams((prev) => ({ ...prev, time: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select time' />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Number of People */}
                <div className='space-y-2'>
                  <Label htmlFor='people' className='flex items-center gap-2'>
                    <Users className='h-4 w-4' />
                    People
                  </Label>
                  <Select
                    value={searchParams.people}
                    onValueChange={(value) =>
                      setSearchParams((prev) => ({ ...prev, people: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Guests' />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(
                        (num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Budget Filter */}
              <div className='mt-4'>
                <Label className='mb-2 block text-sm font-medium text-gray-700'>
                  Budget Range
                </Label>
                <div className='flex flex-wrap gap-2'>
                  {BUDGET_OPTIONS.map((option) => (
                    <Button
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
                    </Button>
                  ))}
                </div>
              </div>

              {/* Search Button */}
              <div className='mt-6 text-center'>
                <Button
                  onClick={handleSearch}
                  size='lg'
                  className='px-12 py-3 text-lg'
                >
                  <Search className='mr-2 h-5 w-5' />
                  Search Restaurants
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className='py-16 bg-gray-50'>
        <div className='mx-auto max-w-6xl px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              Why Choose RestoSaaS?
            </h2>
            <p className='text-xl text-gray-600'>
              The best platform for discovering and booking restaurants
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
                <Search className='h-8 w-8 text-blue-600' />
              </div>
              <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                Easy Search
              </h3>
              <p className='text-gray-600'>
                Find restaurants by location, cuisine, and preferences with our
                advanced search
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                <Clock className='h-8 w-8 text-green-600' />
              </div>
              <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                Instant Reservations
              </h3>
              <p className='text-gray-600'>
                Book your table instantly with real-time availability and
                confirmation
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100'>
                <Utensils className='h-8 w-8 text-purple-600' />
              </div>
              <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                Curated Selection
              </h3>
              <p className='text-gray-600'>
                Discover handpicked restaurants with verified reviews and
                ratings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
