import { useState } from 'react';
import { Button } from '@restosaas/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@restosaas/ui';
import { api as apiClient } from '../lib/api-client';
import { Star, Upload, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import type { Image } from '@restosaas/types';

interface RestaurantGalleryProps {
  restaurantId: string;
  restaurantName: string;
  images: Image[];
  onImagesChange: (images: Image[]) => void;
}

export function RestaurantGallery({
  restaurantId,
  restaurantName,
  images,
  onImagesChange,
}: RestaurantGalleryProps) {
  const [isAddImageDialogOpen, setIsAddImageDialogOpen] = useState(false);
  const [isViewImageDialogOpen, setIsViewImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetMainImage = async (imageId: string) => {
    setIsLoading(true);
    try {
      await apiClient.setMainImage(restaurantId, imageId);

      // Update local state
      const updatedImages = images.map((img) => ({
        ...img,
        isMain: img.id === imageId,
      }));
      onImagesChange(updatedImages);
    } catch (error) {
      console.error('Failed to set main image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setIsLoading(true);
    try {
      await apiClient.deleteImageFromRestaurant(restaurantId, imageId);

      // Update local state
      const updatedImages = images.filter((img) => img.id !== imageId);
      onImagesChange(updatedImages);
    } catch (error) {
      console.error('Failed to delete image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return;

    setIsLoading(true);
    try {
      const response = await apiClient.addImageToRestaurant(restaurantId, {
        url: newImageUrl,
        alt: newImageAlt || restaurantName,
        isMain: images.length === 0, // First image becomes main
      });

      // Update local state
      onImagesChange([...images, response.data]);
      setNewImageUrl('');
      setNewImageAlt('');
      setIsAddImageDialogOpen(false);
    } catch (error) {
      console.error('Failed to add image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mainImage = images.find((img) => img.isMain) || images[0];

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-xl font-semibold'>Restaurant Gallery</h2>
          <p className='text-gray-600'>Manage your restaurant images</p>
        </div>
        <Button onClick={() => setIsAddImageDialogOpen(true)}>
          <Plus className='w-4 h-4 mr-2' />
          Add Image
        </Button>
      </div>

      {/* Main Image */}
      {mainImage && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Star className='w-5 h-5 text-yellow-500' />
              Main Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='relative group'>
              <img
                src={mainImage.url}
                alt={mainImage.alt}
                className='w-full h-64 object-cover rounded-lg'
              />
              <div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity'>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() => {
                    setSelectedImage(mainImage);
                    setIsViewImageDialogOpen(true);
                  }}
                  className='bg-white/90 hover:bg-white text-gray-900'
                >
                  <ImageIcon className='w-4 h-4 mr-2' />
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Grid */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Images ({images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {images.map((image) => (
                <div key={image.id} className='relative group'>
                  <img
                    src={image.url}
                    alt={image.alt}
                    className='w-full h-32 object-cover rounded-lg cursor-pointer'
                    onClick={() => {
                      setSelectedImage(image);
                      setIsViewImageDialogOpen(true);
                    }}
                  />
                  <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2'>
                    <Button
                      size='sm'
                      variant='secondary'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetMainImage(image.id);
                      }}
                      disabled={isLoading || image.isMain}
                      className='bg-white/90 hover:bg-white text-gray-900'
                    >
                      <Star className='w-4 h-4 mr-1' />
                      {image.isMain ? 'Main' : 'Set Main'}
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image.id);
                      }}
                      disabled={isLoading}
                      className='bg-red-500/90 hover:bg-red-500 text-white'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                  {image.isMain && (
                    <div className='absolute top-2 left-2'>
                      <span className='bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium'>
                        Main
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {images.length === 0 && (
        <Card>
          <CardContent className='text-center py-12'>
            <ImageIcon className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              No images yet
            </h3>
            <p className='text-gray-600 mb-4'>
              Add images to showcase your restaurant
            </p>
            <Button onClick={() => setIsAddImageDialogOpen(true)}>
              <Plus className='w-4 h-4 mr-2' />
              Add First Image
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Image Dialog */}
      <Dialog
        open={isAddImageDialogOpen}
        onOpenChange={setIsAddImageDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image to {restaurantName}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Image URL *
              </label>
              <input
                type='url'
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder='https://example.com/image.jpg'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Alt Text
              </label>
              <input
                type='text'
                value={newImageAlt}
                onChange={(e) => setNewImageAlt(e.target.value)}
                placeholder='Describe the image...'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setIsAddImageDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddImage}
                disabled={isLoading || !newImageUrl.trim()}
              >
                {isLoading ? 'Adding...' : 'Add Image'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Image Dialog */}
      <Dialog
        open={isViewImageDialogOpen}
        onOpenChange={setIsViewImageDialogOpen}
      >
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className='space-y-4'>
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className='w-full h-96 object-contain rounded-lg'
              />
              <div className='flex justify-between items-center'>
                <div>
                  <p className='font-medium'>{selectedImage.alt}</p>
                  <p className='text-sm text-gray-500'>
                    {selectedImage.isMain ? 'Main Image' : 'Gallery Image'}
                  </p>
                </div>
                <div className='flex gap-2'>
                  {!selectedImage.isMain && (
                    <Button
                      onClick={() => {
                        handleSetMainImage(selectedImage.id);
                        setIsViewImageDialogOpen(false);
                      }}
                      disabled={isLoading}
                    >
                      <Star className='w-4 h-4 mr-2' />
                      Set as Main
                    </Button>
                  )}
                  <Button
                    variant='destructive'
                    onClick={() => {
                      handleDeleteImage(selectedImage.id);
                      setIsViewImageDialogOpen(false);
                    }}
                    disabled={isLoading}
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
