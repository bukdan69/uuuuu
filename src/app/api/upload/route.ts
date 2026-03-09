import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Check for single file upload (banner or listing image)
    const singleFile = formData.get('file') as File;
    
    // Check for KYC multiple files
    const ktpImage = formData.get('ktp_image') as File;
    const selfieImage = formData.get('selfie_image') as File;

    // Check upload type
    const uploadType = formData.get('type') as string; // 'banner', 'listing', or undefined for KYC

    // Handle single file upload (banner or listing)
    if (singleFile) {
      // Validate file type
      if (!singleFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
      }

      // Validate file size (max 5MB)
      if (singleFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = singleFile.name.split('.').pop();
      
      let uploadsDir: string;
      let filename: string;
      let urlPath: string;

      // Determine upload directory based on type
      if (uploadType === 'listing') {
        filename = `listing-${user.id}-${timestamp}-${randomString}.${extension}`;
        uploadsDir = join(process.cwd(), 'public', 'uploads', 'listings');
        urlPath = `/uploads/listings/${filename}`;
      } else {
        // Default to banner
        filename = `banner-${timestamp}-${randomString}.${extension}`;
        uploadsDir = join(process.cwd(), 'public', 'uploads', 'banners');
        urlPath = `/uploads/banners/${filename}`;
      }

      // Create uploads directory if it doesn't exist
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Save file
      const bytes = await singleFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      // Return public URL
      return NextResponse.json({ success: true, url: urlPath });
    }

    // Handle KYC multiple files upload
    if (ktpImage && selfieImage) {
      // Validate KTP image
      if (!ktpImage.type.startsWith('image/')) {
        return NextResponse.json({ error: 'KTP file must be an image' }, { status: 400 });
      }
      if (ktpImage.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'KTP file size must be less than 5MB' }, { status: 400 });
      }

      // Validate Selfie image
      if (!selfieImage.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Selfie file must be an image' }, { status: 400 });
      }
      if (selfieImage.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Selfie file size must be less than 5MB' }, { status: 400 });
      }

      // Create uploads directory for KYC
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'kyc');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Upload KTP image
      const ktpTimestamp = Date.now();
      const ktpRandomString = Math.random().toString(36).substring(2, 15);
      const ktpExtension = ktpImage.name.split('.').pop();
      const ktpFilename = `ktp-${user.id}-${ktpTimestamp}-${ktpRandomString}.${ktpExtension}`;
      
      const ktpBytes = await ktpImage.arrayBuffer();
      const ktpBuffer = Buffer.from(ktpBytes);
      const ktpFilepath = join(uploadsDir, ktpFilename);
      await writeFile(ktpFilepath, ktpBuffer);

      // Upload Selfie image
      const selfieTimestamp = Date.now();
      const selfieRandomString = Math.random().toString(36).substring(2, 15);
      const selfieExtension = selfieImage.name.split('.').pop();
      const selfieFilename = `selfie-${user.id}-${selfieTimestamp}-${selfieRandomString}.${selfieExtension}`;
      
      const selfieBytes = await selfieImage.arrayBuffer();
      const selfieBuffer = Buffer.from(selfieBytes);
      const selfieFilepath = join(uploadsDir, selfieFilename);
      await writeFile(selfieFilepath, selfieBuffer);

      // Return public URLs
      const ktp_image_url = `/uploads/kyc/${ktpFilename}`;
      const selfie_image_url = `/uploads/kyc/${selfieFilename}`;

      return NextResponse.json({ ktp_image_url, selfie_image_url });
    }

    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
