export function Features() {
  return (
    <div className='py-16 bg-neutral-50'>
      <div className='mx-auto max-w-6xl px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>
            Why Choose RestoSaaS?
          </h2>
          <p className='text-lg text-gray-600'>
            The best platform for discovering and booking restaurants
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='rounded-xl border bg-card text-card-foreground shadow enhanced-card text-center p-6'>
            <div className='p-0'>
              <div className='w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center'>
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
                  className='lucide lucide-search h-8 w-8 text-primary'
                  aria-hidden='true'
                >
                  <path d='m21 21-4.34-4.34'></path>
                  <circle cx='11' cy='11' r='8'></circle>
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                Easy Search
              </h3>
              <p className='text-gray-600'>
                Find restaurants by location, cuisine, and preferences with our
                advanced search
              </p>
            </div>
          </div>
          <div className='rounded-xl border bg-card text-card-foreground shadow enhanced-card text-center p-6'>
            <div className='p-0'>
              <div className='w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center'>
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
                  className='lucide lucide-zap h-8 w-8 text-secondary'
                  aria-hidden='true'
                >
                  <path d='M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'></path>
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                Instant Reservations
              </h3>
              <p className='text-gray-600'>
                Book your table instantly with real-time availability and
                confirmation
              </p>
            </div>
          </div>
          <div className='rounded-xl border bg-card text-card-foreground shadow enhanced-card text-center p-6'>
            <div className='p-0'>
              <div className='w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center'>
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
                  className='lucide lucide-star h-8 w-8 text-accent'
                  aria-hidden='true'
                >
                  <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z'></path>
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
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
