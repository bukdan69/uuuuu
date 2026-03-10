# 🚀 Setup Production Database di Vercel

## ❌ Masalah: Tidak Ada Product Listing

**URL:** https://aaaaaaaaam.vercel.app/

**Symptom:**
- Homepage loading tapi tidak ada listings
- Categories mungkin ada tapi listings kosong
- Database production belum di-seed

## 🔍 Root Cause

### Development vs Production:

**Development (localhost):**
- ✅ Database: Local Supabase
- ✅ Data: Sudah di-seed (25 listings)
- ✅ Working: Listings tampil

**Production (Vercel):**
- ❓ Database: Production Supabase
- ❌ Data: Kosong (belum di-seed)
- ❌ Not working: No listings

### Kenapa Database Kosong?

1. **Vercel tidak auto-seed** database
2. **Seed script** hanya jalan di development
3. **Production database** perlu di-seed manual
4. **Migration** mungkin belum jalan

## ✅ SOLUSI

### Step 1: Verify Environment Variables di Vercel

1. **Login ke Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Pilih project:** `aaaaaaaaam`

3. **Go to Settings → Environment Variables**

4. **Check variables:**
   ```
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

5. **Pastikan DATABASE_URL mengarah ke production database**

### Step 2: Run Migrations di Production

**Option A: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

**Option B: Via Local with Production URL**

```bash
# Set production DATABASE_URL temporarily
$env:DATABASE_URL="your_production_database_url"

# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

### Step 3: Seed Production Database

**Option A: Direct Seed (Recommended)**

```bash
# Set production DATABASE_URL
$env:DATABASE_URL="your_production_database_url"
$env:DIRECT_URL="your_production_direct_url"

# Run seed script
npx tsx prisma/seed.ts
```

**Option B: Create Seed API Endpoint**

Create file: `src/app/api/admin/seed-production/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { checkUserRole } from '@/lib/auth/checkRole';

// POST /api/admin/seed-production
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if already seeded
    const existingListings = await db.listing.count();
    if (existingListings > 0) {
      return NextResponse.json({
        message: 'Database already seeded',
        listingsCount: existingListings
      });
    }

    // Run seed logic here (copy from prisma/seed.ts)
    // ... seed categories
    // ... seed users
    // ... seed listings
    // ... seed sponsors

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully'
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
```

Then call:
```bash
curl -X POST https://aaaaaaaaam.vercel.app/api/admin/seed-production \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Option C: Via Supabase Dashboard**

1. Login to Supabase Dashboard
2. Go to SQL Editor
3. Run seed SQL manually
4. Or import data from CSV

### Step 4: Verify Data

**Check via API:**

```bash
# Check listings count
curl https://aaaaaaaaam.vercel.app/api/landing

# Should return:
# {
#   "categories": [...],
#   "featuredListings": [...],
#   "latestListings": [...],
#   ...
# }
```

**Check via Supabase Dashboard:**

1. Login to Supabase
2. Go to Table Editor
3. Check tables:
   - `listings` - Should have 25+ rows
   - `categories` - Should have 18+ rows
   - `profiles` - Should have users
   - `sponsors` - Should have 9 rows

## 🎯 Quick Fix Script

Create: `scripts/seed-production.ts`

```typescript
import { PrismaClient } from '@prisma/client';

// Use production DATABASE_URL from environment
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function seedProduction() {
  console.log('🌱 Seeding production database...\n');

  try {
    // Check if already seeded
    const existingListings = await prisma.listing.count();
    
    if (existingListings > 0) {
      console.log(`⚠️  Database already has ${existingListings} listings`);
      console.log('   Skipping seed to avoid duplicates.\n');
      return;
    }

    // Import and run main seed
    const { seed } = await import('../prisma/seed');
    await seed();

    console.log('✅ Production database seeded successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding production:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProduction();
```

**Run:**

```bash
# Set production URL
$env:DATABASE_URL="your_production_url"

# Run seed
npx tsx scripts/seed-production.ts
```

## 📋 Checklist

### Before Seeding:

- [ ] ✅ Verify DATABASE_URL in Vercel
- [ ] ✅ Check database is accessible
- [ ] ✅ Run migrations (`prisma migrate deploy`)
- [ ] ✅ Generate Prisma client

### Seeding:

- [ ] ✅ Run seed script
- [ ] ✅ Verify data in Supabase Dashboard
- [ ] ✅ Check API returns data
- [ ] ✅ Test homepage shows listings

### After Seeding:

- [ ] ✅ Homepage shows listings
- [ ] ✅ Categories populated
- [ ] ✅ Sponsors visible
- [ ] ✅ All features working

## 🔧 Troubleshooting

### Error: "Connection refused"

**Cause:** DATABASE_URL incorrect or database not accessible

**Fix:**
1. Check DATABASE_URL in Vercel
2. Verify Supabase project is active
3. Check IP whitelist (if any)

### Error: "Table does not exist"

**Cause:** Migrations not run

**Fix:**
```bash
npx prisma migrate deploy
```

### Error: "Unique constraint violation"

**Cause:** Data already exists

**Fix:**
1. Check existing data
2. Skip seed or reset database
3. Use `upsert` instead of `create`

### No Data Showing

**Cause:** API not returning data

**Fix:**
1. Check browser console for errors
2. Check Network tab for API calls
3. Verify API endpoint works:
   ```
   https://aaaaaaaaam.vercel.app/api/landing
   ```

## 🎯 Recommended Approach

### For Production Setup:

1. **Use Vercel CLI** (most reliable)
   ```bash
   vercel env pull .env.production
   DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx tsx prisma/seed.ts
   ```

2. **Or create one-time seed endpoint**
   - Deploy seed API
   - Call once
   - Remove endpoint

3. **Or use Supabase SQL Editor**
   - Export data from dev
   - Import to production

## 📊 Expected Results

After seeding:

```
✅ 25+ listings in database
✅ 18+ categories
✅ 9+ users
✅ 9 sponsors
✅ Homepage shows all listings
✅ Categories populated
✅ Search working
✅ All features functional
```

## 🆘 Need Help?

If still having issues:

1. **Check Vercel Logs:**
   - Vercel Dashboard → Functions → View logs
   - Look for database errors

2. **Check Supabase Logs:**
   - Supabase Dashboard → Logs
   - Look for connection errors

3. **Test API directly:**
   ```bash
   curl https://aaaaaaaaam.vercel.app/api/landing
   ```

4. **Check browser console:**
   - F12 → Console
   - Look for JavaScript errors

## 📝 Notes

### Development vs Production:

- **Dev:** Uses `.env.local` (local Supabase)
- **Prod:** Uses Vercel env vars (production Supabase)
- **Seed:** Must be run separately for each environment

### Best Practice:

1. Keep dev and prod databases separate
2. Seed dev frequently for testing
3. Seed prod once during initial setup
4. Use migrations for schema changes
5. Use admin panel for data management

---

**Status:** 📋 Waiting for production database seed

**Next Steps:**
1. Verify Vercel environment variables
2. Run migrations in production
3. Seed production database
4. Test homepage
5. Verify all features working
