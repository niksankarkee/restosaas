'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { api } from '@/lib/api';
import { Star, Upload, Trash2, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';

interface RestaurantImage {
  ID: string;
  URL: string;
  Alt: string;
  IsMain: boolean;
  DisplayOrder: number;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  mainImageId?: string;
  images?: RestaurantImage[];
}

function RestaurantImagesPageContent() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [images, setImages] = useState<RestaurantImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    // Prevent duplicate calls
    if (isFetching) return;

    try {
      setIsFetching(true);
      setIsLoading(true);
      const response = await api.get('/owner/restaurants/me');
      setRestaurant(response.data);
      setImages(response.data.images || []);
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const handleSetMainImage = async (imageId: string) => {
    if (!restaurant) return;

    try {
      await api.post(
        `/owner/restaurants/${restaurant.id}/images/${imageId}/set-main`
      );

      // Update local state
      setImages((prevImages) =>
        prevImages.map((img) => ({
          ...img,
          IsMain: img.ID === imageId,
        }))
      );

      // Update restaurant main image ID
      setRestaurant((prev) =>
        prev ? { ...prev, mainImageId: imageId } : null
      );
    } catch (error) {
      console.error('Failed to set main image:', error);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    if (!restaurant) return;

    try {
      await api.delete(`/owner/restaurants/${restaurant.id}/images/${imageId}`);
      setImages((prevImages) => prevImages.filter((img) => img.ID !== imageId));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handleCloudinaryUpload = async (urls: string[]) => {
    if (!restaurant || urls.length === 0) return;

    setIsUploading(true);
    try {
      // Create image objects for the API
      const imageData = urls.map((url, index) => ({
        url: url,
        alt: `Restaurant image ${index + 1}`,
        isMain: false,
        displayOrder: images.length + index,
      }));

      // Send to your API to save to database
      const response = await api.post(
        `/owner/restaurants/${restaurant.id}/images`,
        { images: imageData }
      );

      // Refresh images
      await fetchRestaurant();
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Failed to save images to database:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadError = (error: string) => {
    console.error('Cloudinary upload error:', error);
    // You can add a toast notification here
  };

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className='h-64 bg-gray-200 rounded'></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <Card>
            <CardContent className='text-center py-12'>
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                Restaurant Not Found
              </h1>
              <p className='text-gray-600 mb-4'>
                Please create a restaurant first.
              </p>
              <Link href='/owner-dashboard'>
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Restaurant Images
            </h1>
            <p className='text-gray-600 mt-2'>
              Manage images for {restaurant.name}
            </p>
          </div>
          <div className='flex gap-2'>
            <Link href='/owner-dashboard'>
              <Button variant='outline'>Back to Dashboard</Button>
            </Link>
            <Button
              onClick={() => setShowUploadDialog(true)}
              disabled={isUploading}
            >
              <Upload className='w-4 h-4 mr-2' />
              {isUploading ? 'Uploading...' : 'Upload Images to Cloudinary'}
            </Button>
          </div>
        </div>

        {images.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <ImageIcon className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No images uploaded yet
              </h3>
              <p className='text-gray-600 mb-4'>
                Upload some images to showcase your restaurant.
              </p>
              <Button
                onClick={() => setShowUploadDialog(true)}
                disabled={isUploading}
              >
                <Upload className='w-4 h-4 mr-2' />
                {isUploading ? 'Uploading...' : 'Upload Images to Cloudinary'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {images.map((image) => (
              <Card key={image.ID} className='overflow-hidden group relative'>
                <div className='aspect-video overflow-hidden'>
                  <img
                    src={image.URL}
                    alt={image.Alt}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                </div>

                {/* Main Image Badge */}
                {image.IsMain && (
                  <div className='absolute top-2 left-2'>
                    <Badge className='bg-yellow-500 hover:bg-yellow-600'>
                      <Star className='w-3 h-3 mr-1' />
                      Main Image
                    </Badge>
                  </div>
                )}

                {/* Action Buttons */}
                <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                  <div className='flex gap-1'>
                    {!image.IsMain && (
                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => handleSetMainImage(image.ID)}
                        className='h-8 w-8 p-0'
                      >
                        <Star className='w-4 h-4' />
                      </Button>
                    )}
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={() => handleDeleteImage(image.ID)}
                      className='h-8 w-8 p-0'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </div>

                <CardContent className='p-3'>
                  <p className='text-sm text-gray-600 truncate'>{image.Alt}</p>
                  <div className='flex items-center justify-between mt-2'>
                    <span className='text-xs text-gray-500'>
                      Order: {image.DisplayOrder}
                    </span>
                    {image.IsMain && (
                      <Badge variant='outline' className='text-xs'>
                        Main
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Instructions */}
        <Card className='mt-8'>
          <CardHeader>
            <CardTitle className='text-lg'>Image Management Tips</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm text-gray-600'>
            <p>
              • <strong>Main Image:</strong> Only one image can be the main
              image. This will be displayed prominently on your restaurant
              listing.
            </p>
            <p>
              • <strong>Image Quality:</strong> Upload high-quality images (at
              least 1200x800px) for best results.
            </p>
            <p>
              • <strong>File Types:</strong> Supported formats: JPG, PNG, WebP
            </p>
            <p>
              • <strong>File Size:</strong> Maximum 10MB per image
            </p>
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        {showUploadDialog && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <Card className='w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <CardTitle>Upload Images to Cloudinary</CardTitle>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowUploadDialog(false)}
                  >
                    <X className='w-4 h-4' />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CloudinaryUpload
                  onUpload={handleCloudinaryUpload}
                  onError={handleUploadError}
                  multiple={true}
                  maxFiles={10}
                  folder='restosaas/restaurants'
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RestaurantImagesPage() {
  return (
    <RoleGuard allowedRoles={['OWNER', 'SUPER_ADMIN']}>
      <RestaurantImagesPageContent />
    </RoleGuard>
  );
}
