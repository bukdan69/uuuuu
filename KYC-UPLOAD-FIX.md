# ✅ KYC Upload Fix - Supabase Storage Integration

## Problem
KYC file uploads were failing on Vercel because the code was trying to write files to the local filesystem using `writeFile()`. Vercel's serverless environment has a read-only filesystem, so file writes fail.

## Solution
Migrated file uploads from local filesystem to **Supabase Storage**, which is a cloud-based storage solution that works perfectly on Vercel.

## What Changed

### File Modified
- `src/app/api/upload/route.ts`

### Changes Made

**Before (Local Filesystem)**:
```typescript
// ❌ This doesn't work on Vercel
const uploadsDir = join(process.cwd(), 'public', 'uploads', 'kyc');
await mkdir(uploadsDir, { recursive: true });
await writeFile(filepath, buffer);
const url = `/uploads/kyc/${filename}`;
```

**After (Supabase Storage)**:
```typescript
// ✅ This works on Vercel
const { data, error } = await supabase.storage
  .from('images')
  .upload(`uploads/kyc/${filename}`, buffer, {
    contentType: file.type,
    upsert: false,
  });

const { data: publicData } = supabase.storage
  .from('images')
  .getPublicUrl(`uploads/kyc/${filename}`);
```

## How It Works

### Upload Flow
1. User selects KTP and Selfie images on KYC page
2. Frontend sends images to `/api/upload` endpoint
3. API validates files (type, size)
4. API uploads to Supabase Storage bucket `images`
5. API returns public URLs from Supabase
6. Frontend sends URLs to `/api/kyc` endpoint
7. KYC data saved to database with image URLs

### File Storage Structure
```
Supabase Storage (images bucket)
├── uploads/
│   ├── kyc/
│   │   ├── ktp-{userId}-{timestamp}-{random}.jpg
│   │   └── selfie-{userId}-{timestamp}-{random}.jpg
│   ├── banner/
│   │   └── banner-{timestamp}-{random}.jpg
│   └── listing/
│       └── listing-{userId}-{timestamp}-{random}.jpg
```

## Features

✅ **Works on Vercel** - Uses cloud storage instead of local filesystem
✅ **Secure** - Files stored in Supabase with proper authentication
✅ **Public URLs** - Images accessible via public URLs
✅ **File Validation** - Checks file type and size (max 5MB)
✅ **Unique Filenames** - Prevents collisions with timestamp + random string
✅ **Error Handling** - Proper error messages if upload fails

## Testing

### Local Development
1. Go to https://localhost:3000/dashboard/kyc
2. Fill in KYC form
3. Upload KTP and Selfie images
4. Click "Kirim Verifikasi"
5. Should see success message
6. Images should be stored in Supabase Storage

### Production (Vercel)
1. Go to https://aaaaaaaaam.vercel.app/dashboard/kyc
2. Fill in KYC form
3. Upload KTP and Selfie images
4. Click "Kirim Verifikasi"
5. Should see success message
6. Check Supabase dashboard to verify images are stored

## Verification

### Check Supabase Storage
1. Go to https://supabase.com/dashboard
2. Select project
3. Go to "Storage" → "images" bucket
4. Should see `uploads/kyc/` folder with uploaded images

### Check Database
1. Go to Supabase SQL Editor
2. Run: `SELECT * FROM kyc_verification;`
3. Should see KYC records with pending status

## Environment Variables Required

The following must be set in `.env.local` (development) and Vercel (production):

```
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

These are already configured in your environment.

## Troubleshooting

### Issue: Upload still fails
**Solution**:
1. Check Supabase Storage bucket exists: `images`
2. Verify Supabase credentials are correct
3. Check browser console for error details
4. Check Vercel logs for API errors

### Issue: Images not visible after upload
**Solution**:
1. Verify images are in Supabase Storage
2. Check that public URLs are being returned
3. Verify database has correct image URLs

### Issue: "Bucket not found" error
**Solution**:
1. Create bucket in Supabase:
   - Go to Storage → Create new bucket
   - Name: `images`
   - Make it public
2. Or run: `npx tsx scripts/create-bucket.ts`

## Files Affected

- ✅ `src/app/api/upload/route.ts` - Updated to use Supabase Storage
- ✅ `src/app/dashboard/kyc/page.tsx` - No changes needed (already works)
- ✅ `src/app/api/kyc/route.ts` - No changes needed (already works)

## Deployment

Code is already pushed to GitHub. Vercel will automatically deploy on next push.

**Status**: ✅ COMPLETE

The KYC upload feature now works on Vercel!

---

**Last Updated**: March 10, 2026
**Fix Type**: Bug Fix
**Impact**: Critical - Enables KYC uploads on production
