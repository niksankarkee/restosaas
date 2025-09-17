// Cloudinary configuration using environment variables
const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dlbi5qdty';
const CLOUDINARY_API_KEY =
  process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '144436799811744';

// Note: API secret should not be exposed to client-side
// For client-side uploads, we'll use unsigned uploads with upload presets

// Helper function to upload image to Cloudinary using server-side API
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'restosaas'
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/upload/cloudinary', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  const result = await response.json();
  return result.url;
};

// Helper function to upload multiple images
export const uploadMultipleToCloudinary = async (
  files: File[],
  folder: string = 'restosaas'
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, folder));
  return Promise.all(uploadPromises);
};

// Helper function to delete image from Cloudinary
// Note: This requires server-side implementation for security
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  // For now, we'll just log the public ID
  // In a production app, you'd call your backend API to delete the image
  console.log('Image deletion requested for public ID:', publicId);
  console.warn('Image deletion should be implemented server-side for security');
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
  const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/);
  return match ? match[1] : null;
};
