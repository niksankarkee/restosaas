'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface RestaurantMapProps {
  name: string;
  address?: string;
  place: string;
}

export function RestaurantMap({ name, address, place }: RestaurantMapProps) {
  // Create a Google Maps search query
  const searchQuery = address ? `${name}, ${address}` : `${name}, ${place}`;
  const encodedQuery = encodeURIComponent(searchQuery);

  // Google Maps embed URL
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodedQuery}`;

  // Fallback to search URL if no API key
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  return (
    <div className='space-y-6'>
      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <MapPin className='h-5 w-5' />
            <span>Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Address Information */}
            <div className='space-y-2'>
              <h3 className='font-semibold text-gray-900'>{name}</h3>
              {address && (
                <p className='text-gray-600 flex items-start space-x-2'>
                  <MapPin className='h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0' />
                  <span>{address}</span>
                </p>
              )}
              <p className='text-gray-600 flex items-start space-x-2'>
                <Navigation className='h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0' />
                <span>{place}</span>
              </p>
            </div>

            {/* Map Placeholder */}
            <div className='relative bg-gray-100 rounded-lg h-64 flex items-center justify-center'>
              <div className='text-center space-y-4'>
                <MapPin className='h-12 w-12 text-gray-400 mx-auto' />
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    Interactive Map
                  </h4>
                  <p className='text-gray-600 text-sm mb-4'>
                    View this restaurant on Google Maps
                  </p>
                  <a
                    href={searchUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    <ExternalLink className='h-4 w-4' />
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <Navigation className='h-4 w-4' />
                <span>Get Directions</span>
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <MapPin className='h-4 w-4' />
                <span>View on Map</span>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Location Info */}
      <Card>
        <CardHeader>
          <CardTitle>Location Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Restaurant Name:</span>
              <span className='font-medium'>{name}</span>
            </div>
            {address && (
              <div className='flex justify-between'>
                <span className='text-gray-600'>Address:</span>
                <span className='font-medium text-right max-w-xs'>
                  {address}
                </span>
              </div>
            )}
            <div className='flex justify-between'>
              <span className='text-gray-600'>Area:</span>
              <span className='font-medium'>{place}</span>
            </div>
            <div className='pt-2 border-t'>
              <p className='text-sm text-gray-500'>
                Click "Open in Google Maps" to get detailed directions, view
                street-level imagery, and see nearby landmarks and
                transportation options.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
