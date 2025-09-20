export function CTA() {
  return (
    <div className='py-16 bg-gradient-to-r from-primary to-secondary'>
      <div className='mx-auto max-w-4xl text-center px-4'>
        <h2 className='text-3xl font-bold text-white mb-4'>
          Ready to Find Your Perfect Restaurant?
        </h2>
        <p className='text-xl text-white/90 mb-8'>
          Join thousands of food lovers who have discovered their favorite
          dining spots with us.
        </p>
        <button className='inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg h-11 rounded-lg px-8 py-3 text-lg'>
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
              className='lucide lucide-circle-check-big h-5 w-5'
              aria-hidden='true'
            >
              <path d='M21.801 10A10 10 0 1 1 17 3.335'></path>
              <path d='m9 11 3 3L22 4'></path>
            </svg>
          </span>
          Browse All Restaurants
        </button>
      </div>
    </div>
  );
}
