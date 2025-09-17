'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} from '@/lib/cloudinary';

interface CloudinaryUploadProps {
  onUpload: (urls: string[]) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  folder?: string;
  className?: string;
}

interface UploadFile {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  error?: string;
}

export function CloudinaryUpload({
  onUpload,
  onError,
  multiple = true,
  maxFiles = 10,
  folder = 'restosaas',
  className = '',
}: CloudinaryUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const remainingSlots = maxFiles - files.length;
    const filesToAdd = fileArray.slice(0, remainingSlots);

    const newFiles: UploadFile[] = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const filesToUpload = files.filter((f) => !f.uploaded);
      const urls: string[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const fileData = filesToUpload[i];

        // Update file status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f === fileData ? { ...f, uploading: true, error: undefined } : f
          )
        );

        try {
          const url = await uploadToCloudinary(fileData.file, folder);
          urls.push(url);

          // Update file status to uploaded
          setFiles((prev) =>
            prev.map((f) =>
              f === fileData
                ? { ...f, uploading: false, uploaded: true, url }
                : f
            )
          );
        } catch (error) {
          console.error('Upload error:', error);
          setFiles((prev) =>
            prev.map((f) =>
              f === fileData
                ? {
                    ...f,
                    uploading: false,
                    uploaded: false,
                    error: 'Upload failed',
                  }
                : f
            )
          );
        }

        // Update progress
        setUploadProgress(((i + 1) / filesToUpload.length) * 100);
      }

      if (urls.length > 0) {
        onUpload(urls);
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError?.('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <div className='relative'>
        <input
          ref={fileInputRef}
          type='file'
          multiple={multiple}
          accept='image/*'
          onChange={(e) => handleFileSelect(e.target.files)}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
          disabled={isUploading || files.length >= maxFiles}
        />
        <Button
          type='button'
          variant='outline'
          className='w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400'
          disabled={isUploading || files.length >= maxFiles}
        >
          <div className='flex flex-col items-center space-y-2'>
            <Upload className='w-8 h-8 text-gray-400' />
            <span className='text-sm text-gray-600'>
              {files.length >= maxFiles
                ? `Maximum ${maxFiles} files reached`
                : `Click to select images${multiple ? ' (multiple)' : ''}`}
            </span>
            <span className='text-xs text-gray-500'>
              JPG, PNG, WebP up to 10MB each
            </span>
          </div>
        </Button>
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium'>
              Selected Files ({files.length}/{maxFiles})
            </span>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={resetUpload}
              disabled={isUploading}
            >
              Clear All
            </Button>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
            {files.map((fileData, index) => (
              <Card key={index} className='relative overflow-hidden'>
                <CardContent className='p-2'>
                  <div className='aspect-square relative'>
                    <img
                      src={fileData.preview}
                      alt={`Preview ${index + 1}`}
                      className='w-full h-full object-cover rounded'
                    />

                    {/* Status Overlay */}
                    {fileData.uploading && (
                      <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                        <div className='text-white text-xs'>Uploading...</div>
                      </div>
                    )}

                    {fileData.uploaded && (
                      <div className='absolute inset-0 bg-green-500 bg-opacity-50 flex items-center justify-center'>
                        <CheckCircle className='w-6 h-6 text-white' />
                      </div>
                    )}

                    {fileData.error && (
                      <div className='absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center'>
                        <X className='w-6 h-6 text-white' />
                      </div>
                    )}

                    {/* Remove Button */}
                    {!fileData.uploading && (
                      <Button
                        type='button'
                        variant='destructive'
                        size='sm'
                        className='absolute top-1 right-1 h-6 w-6 p-0'
                        onClick={() => removeFile(index)}
                      >
                        <X className='w-3 h-3' />
                      </Button>
                    )}
                  </div>

                  <div className='mt-1 text-xs text-gray-600 truncate'>
                    {fileData.file.name}
                  </div>

                  {fileData.error && (
                    <div className='text-xs text-red-500'>{fileData.error}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className='w-full' />
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !isUploading && (
        <Button
          onClick={uploadFiles}
          className='w-full'
          disabled={files.every((f) => f.uploaded)}
        >
          <Upload className='w-4 h-4 mr-2' />
          Upload {files.filter((f) => !f.uploaded).length} Image
          {files.filter((f) => !f.uploaded).length !== 1 ? 's' : ''} to
          Cloudinary
        </Button>
      )}
    </div>
  );
}
