import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary on server-side
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlbi5qdty',
  api_key: process.env.CLOUDINARY_API_KEY || '144436799811744',
  api_secret:
    process.env.CLOUDINARY_API_SECRET || 'kbXU6HvZlZ1Ez-KPg_mZ389cBjw',
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'restosaas';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folder,
            resource_type: 'auto',
            transformation: [
              { fetch_format: 'auto', quality: 'auto' },
              { width: 1200, height: 800, crop: 'fill', gravity: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: (result as any).secure_url,
      public_id: (result as any).public_id,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
