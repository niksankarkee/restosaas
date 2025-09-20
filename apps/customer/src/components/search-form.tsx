'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SearchForm() {
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    area: '',
    cuisine: '',
    date: '',
    time: '',
    people: '2',
    budget: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Build query parameters
    const params = new URLSearchParams();
    if (searchData.area) params.append('area', searchData.area);
    if (searchData.cuisine) params.append('cuisine', searchData.cuisine);
    if (searchData.date) params.append('date', searchData.date);
    if (searchData.time) params.append('time', searchData.time);
    if (searchData.people) params.append('people', searchData.people);
    if (searchData.budget) params.append('budget', searchData.budget);

    // Navigate to restaurants page with search parameters
    router.push(`/restaurants?${params.toString()}`);
  };

  return (
    <div className='relative z-20 -mt-20 px-4'>
      <div className='mx-auto max-w-6xl'>
        <div className='rounded-xl border bg-white shadow-2xl'>
          <div className='p-8'>
            <div className='mb-6 text-center'>
              <h2 className='mb-2 text-3xl font-bold text-gray-900'>
                Search Restaurants
              </h2>
              <p className='text-gray-600'>
                Find the perfect restaurant for your next meal
              </p>
            </div>
            <form onSubmit={handleSearch}>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-neutral-700 flex items-center gap-1'>
                    Area
                  </label>
                  <div className='relative'>
                    <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='lucide lucide-map-pin h-4 w-4'
                        aria-hidden='true'
                      >
                        <path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0'></path>
                        <circle cx='12' cy='10' r='3'></circle>
                      </svg>
                    </div>
                    <input
                      type='text'
                      value={searchData.area}
                      onChange={(e) =>
                        setSearchData({ ...searchData, area: e.target.value })
                      }
                      className='flex w-full rounded-lg border border-gray-300 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-10 px-3 py-2 pl-10'
                      placeholder='Enter area or city'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-neutral-700 flex items-center gap-1'>
                    Cuisine
                  </label>
                  <div className='relative'>
                    <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='lucide lucide-utensils h-4 w-4'
                        aria-hidden='true'
                      >
                        <path d='M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2'></path>
                        <path d='M7 2v20'></path>
                        <path d='M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'></path>
                      </svg>
                    </div>
                    <input
                      type='text'
                      value={searchData.cuisine}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          cuisine: e.target.value,
                        })
                      }
                      className='flex w-full rounded-lg border border-gray-300 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-10 px-3 py-2 pl-10'
                      placeholder='Enter cuisine type (e.g., Italian, Chinese, Japanese)'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-neutral-700 flex items-center gap-1'>
                    Date
                  </label>
                  <div className='relative'>
                    <input
                      type='date'
                      value={searchData.date}
                      onChange={(e) =>
                        setSearchData({ ...searchData, date: e.target.value })
                      }
                      className='flex w-full rounded-lg border border-gray-300 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-10 px-3 py-2'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-neutral-700 flex items-center gap-1'>
                    Time
                  </label>
                  <div className='relative'>
                    <select
                      value={searchData.time}
                      onChange={(e) =>
                        setSearchData({ ...searchData, time: e.target.value })
                      }
                      className='flex w-full rounded-lg border border-gray-300 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-10 px-3 py-2'
                    >
                      <option value=''>Select time</option>
                      <option value='Any Time'>Any Time</option>
                      <option value='6:00 AM'>6:00 AM</option>
                      <option value='7:00 AM'>7:00 AM</option>
                      <option value='8:00 AM'>8:00 AM</option>
                      <option value='9:00 AM'>9:00 AM</option>
                      <option value='10:00 AM'>10:00 AM</option>
                      <option value='11:00 AM'>11:00 AM</option>
                      <option value='12:00 PM'>12:00 PM</option>
                      <option value='1:00 PM'>1:00 PM</option>
                      <option value='2:00 PM'>2:00 PM</option>
                      <option value='3:00 PM'>3:00 PM</option>
                      <option value='4:00 PM'>4:00 PM</option>
                      <option value='5:00 PM'>5:00 PM</option>
                      <option value='6:00 PM'>6:00 PM</option>
                      <option value='7:00 PM'>7:00 PM</option>
                      <option value='8:00 PM'>8:00 PM</option>
                      <option value='9:00 PM'>9:00 PM</option>
                      <option value='10:00 PM'>10:00 PM</option>
                      <option value='11:00 PM'>11:00 PM</option>
                    </select>
                  </div>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-neutral-700 flex items-center gap-1'>
                    People
                  </label>
                  <div className='relative'>
                    <select
                      value={searchData.people}
                      onChange={(e) =>
                        setSearchData({ ...searchData, people: e.target.value })
                      }
                      className='flex w-full rounded-lg border border-gray-300 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-10 px-3 py-2'
                    >
                      <option value=''>Number of guests</option>
                      <option value='1'>1 Guest</option>
                      <option value='2'>2 Guests</option>
                      <option value='3'>3 Guests</option>
                      <option value='4'>4 Guests</option>
                      <option value='5'>5 Guests</option>
                      <option value='6'>6 Guests</option>
                      <option value='7'>7 Guests</option>
                      <option value='8'>8 Guests</option>
                      <option value='9'>9 Guests</option>
                      <option value='10'>10 Guests</option>
                      <option value='11'>11 Guests</option>
                      <option value='12'>12 Guests</option>
                      <option value='13'>13 Guests</option>
                      <option value='14'>14 Guests</option>
                      <option value='15'>15 Guests</option>
                      <option value='16'>16 Guests</option>
                      <option value='17'>17 Guests</option>
                      <option value='18'>18 Guests</option>
                      <option value='19'>19 Guests</option>
                      <option value='20'>20 Guests</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className='mt-6'>
                <label className='mb-3 block text-sm font-medium text-gray-700'>
                  Budget
                </label>
                <div className='flex flex-wrap gap-2'>
                  <button
                    type='button'
                    onClick={() => setSearchData({ ...searchData, budget: '' })}
                    className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-9 rounded-md px-3 ${
                      searchData.budget === ''
                        ? 'bg-blue-600 text-white shadow-md hover:shadow-lg'
                        : 'border border-gray-300 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    Any Budget
                  </button>
                  <button
                    type='button'
                    onClick={() =>
                      setSearchData({ ...searchData, budget: '1' })
                    }
                    className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-9 rounded-md px-3 ${
                      searchData.budget === '1'
                        ? 'bg-blue-600 text-white shadow-md hover:shadow-lg'
                        : 'border border-gray-300 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    Rs - Budget Friendly
                  </button>
                  <button
                    type='button'
                    onClick={() =>
                      setSearchData({ ...searchData, budget: '2' })
                    }
                    className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-9 rounded-md px-3 ${
                      searchData.budget === '2'
                        ? 'bg-blue-600 text-white shadow-md hover:shadow-lg'
                        : 'border border-gray-300 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    Rs Rs - Moderate
                  </button>
                  <button
                    type='button'
                    onClick={() =>
                      setSearchData({ ...searchData, budget: '3' })
                    }
                    className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-9 rounded-md px-3 ${
                      searchData.budget === '3'
                        ? 'bg-blue-600 text-white shadow-md hover:shadow-lg'
                        : 'border border-gray-300 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    Rs Rs Rs - Expensive
                  </button>
                  <button
                    type='button'
                    onClick={() =>
                      setSearchData({ ...searchData, budget: '4' })
                    }
                    className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-9 rounded-md px-3 ${
                      searchData.budget === '4'
                        ? 'bg-blue-600 text-white shadow-md hover:shadow-lg'
                        : 'border border-gray-300 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    Rs Rs Rs Rs - Very Expensive
                  </button>
                </div>
              </div>
              <div className='mt-6 text-center'>
                <button
                  type='submit'
                  className='inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg h-11 rounded-lg px-8 py-3 text-lg'
                >
                  <span className='mr-2'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-5 w-5'
                      aria-hidden='true'
                    >
                      <path d='m21 21-4.34-4.34'></path>
                      <circle cx='11' cy='11' r='8'></circle>
                    </svg>
                  </span>
                  Search Restaurants
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
