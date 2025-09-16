'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Image {
  ID: string;
  URL: string;
  Alt: string;
  IsMain: boolean;
  DisplayOrder: number;
}

interface RestaurantGalleryProps {
  images: Image[];
}

export function RestaurantGallery({ images }: RestaurantGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Card>
        <CardContent className='text-center py-12'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            No Images Available
          </h3>
          <p className='text-gray-600'>
            This restaurant hasn't uploaded any photos yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort images by display order
  const sortedImages = [...images].sort(
    (a, b) => a.DisplayOrder - b.DisplayOrder
  );

  const openImageModal = (image: Image, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    const newIndex =
      currentIndex > 0 ? currentIndex - 1 : sortedImages.length - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(sortedImages[newIndex]);
  };

  const goToNext = () => {
    const newIndex =
      currentIndex < sortedImages.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setSelectedImage(sortedImages[newIndex]);
  };

  return (
    <div className='space-y-6'>
      {/* Main Image Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {sortedImages.map((image, index) => (
          <Card
            key={image.ID}
            className='group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow'
            onClick={() => openImageModal(image, index)}
          >
            <div className='relative'>
              <img
                src={image.URL}
                alt={image.Alt || 'Restaurant image'}
                className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
              />
              {image.IsMain && (
                <Badge className='absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600'>
                  <Star className='h-3 w-3 mr-1' />
                  Main
                </Badge>
              )}
              <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center'>
                <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  <Button size='sm' variant='secondary'>
                    View Full Size
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={closeImageModal}>
        <DialogContent className='max-w-4xl max-h-[90vh] p-0'>
          <DialogHeader className='p-6 pb-0'>
            <DialogTitle className='flex items-center justify-between'>
              <span>Restaurant Gallery</span>
              {selectedImage?.IsMain && (
                <Badge className='bg-yellow-500 hover:bg-yellow-600'>
                  <Star className='h-3 w-3 mr-1' />
                  Main Image
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className='relative'>
            {selectedImage && (
              <img
                src={selectedImage.URL}
                alt={selectedImage.Alt || 'Restaurant image'}
                className='w-full h-auto max-h-[70vh] object-contain'
              />
            )}

            {/* Navigation Buttons */}
            {sortedImages.length > 1 && (
              <>
                <Button
                  variant='outline'
                  size='icon'
                  className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white'
                  onClick={goToPrevious}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white'
                  onClick={goToNext}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </>
            )}
          </div>

          {/* Image Counter */}
          {sortedImages.length > 1 && (
            <div className='p-6 pt-0 text-center text-sm text-gray-500'>
              {currentIndex + 1} of {sortedImages.length}
            </div>
          )}

          {/* Thumbnail Strip */}
          {sortedImages.length > 1 && (
            <div className='p-6 pt-0'>
              <div className='flex space-x-2 overflow-x-auto'>
                {sortedImages.map((image, index) => (
                  <button
                    key={image.ID}
                    onClick={() => {
                      setCurrentIndex(index);
                      setSelectedImage(image);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                      index === currentIndex
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.URL}
                      alt={image.Alt || 'Thumbnail'}
                      className='w-full h-full object-cover'
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
