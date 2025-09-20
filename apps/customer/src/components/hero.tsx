export function Hero() {
  return (
    <div className='relative h-[70vh] w-full overflow-hidden'>
      <div
        className='absolute inset-0 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg)',
        }}
      >
        <div className='absolute inset-0 bg-black bg-opacity-40'></div>
      </div>
      <div className='relative z-10 flex h-full items-center justify-center'>
        <div className='text-center text-white'>
          <h1 className='mb-4 text-5xl font-bold md:text-6xl'>
            Find Your Perfect
            <span className='block restaurant-gradient-text'>
              Dining Experience
            </span>
          </h1>
          <p className='mb-8 text-xl md:text-2xl'>
            Discover amazing restaurants, make reservations, and enjoy great
            food
          </p>
        </div>
      </div>
    </div>
  );
}
