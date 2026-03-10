# Fix: Vercel Deployment Tidak Ada Data

## Problem

Setelah deploy di Vercel, website tidak menampilkan data produk, sponsor, dan listing karena:
1. Database production belum di-migrate (table belum ada)
2. Auto-seed script gagal karena table belum ada
3. Environment variables di Vercel mungkin salah format

## Solusi

### Step 1: Fix Vercel Environment Variables

1. Buka Vercel Dashboard: https://vercel.com/dashboard
2. Pilih project: `aaaaaaaaam`
3. Settings → Environment Variables
4. Update/tambah variables berikut:

```
DATABASE_URL=postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**PENTING**: 
- Gunakan `postgresql://` bukan `https://`
- Gunakan region `aws-1` bukan `aws-0`
- Password: `Bukdan%23kubang101` (# di-encode jadi %23)

5. Save changes
6. Redeploy (Deployments → Latest → ... → Redeploy)

### Step 2: Manual Migration & Seed (Jika Step 1 Gagal)

Jika setelah redeploy masih belum ada data, jalankan manual dari local:

#### 2.1 Set Environment Variables

```powershell
$env:DATABASE_URL="postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

$env:DIRECT_URL="postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

#### 2.2 Generate Prisma Client

```powershell
npx prisma generate
```

#### 2.3 Run Migration

```powershell
npx prisma migrate deploy
```

Output yang diharapkan:
```
1 migration found in prisma/migrations
Applying migration `20240101000000_init`
✔ Applied migration in XXXms
```

#### 2.4 Run Seed

```powershell
npx tsx scripts/auto-seed-vercel.ts
```

Output yang diharapkan:
```
🌱 Auto-Seed for Vercel Deployment
✅ Connected to database
🚀 Database is empty - starting seed process...
📂 Creating categories...
✅ Created 7 categories
👥 Creating users...
✅ Created 3 users
📦 Creating listings...
✅ Created 10 listings
🏢 Creating sponsors...
✅ Created 9 sponsors
🎉 Auto-seed completed successfully!
```

#### 2.5 Verify Data

```powershell
npx tsx scripts/check-production-data.ts
```

Output yang diharapkan:
```
📊 Data Summary:
   Listings: 10
   Categories: 7
   Users: 3
   Sponsors: 9
✅ Database has data
```

### Step 3: Test Website

Buka: https://aaaaaaaaam.vercel.app/

Harus tampil:
- ✅ 10 produk di listings section
- ✅ 7 kategori
- ✅ 9 sponsor logos di footer

### Step 4: Test API

```bash
curl https://aaaaaaaaam.vercel.app/api/landing
```

Harus return JSON dengan:
```json
{
  "listings": [...],  // 10 listings
  "categories": [...], // 7 categories
  "sponsors": [...]    // 9 sponsors
}
```

## Troubleshooting

### Error: "Tenant or user not found"

**Penyebab**: Kredensial database salah atau region salah

**Solusi**:
1. Cek region: harus `aws-1` bukan `aws-0`
2. Cek password: `Bukdan%23kubang101` (# = %23)
3. Cek username: `postgres.rdnbvknftxyddjtxbsgc`

### Error: "Table does not exist"

**Penyebab**: Migration belum jalan

**Solusi**:
```powershell
npx prisma migrate deploy
```

### Error: "P1012 Invalid URL schema"

**Penyebab**: URL pakai `https://` bukan `postgresql://`

**Solusi**: Ganti `https://` dengan `postgresql://`

### Auto-seed Gagal di Vercel

**Penyebab**: Environment variables salah atau migration belum jalan

**Solusi**:
1. Fix environment variables di Vercel (Step 1)
2. Redeploy
3. Atau seed manual dari local (Step 2)

## Verifikasi Final

Checklist:
- [ ] Vercel environment variables sudah benar
- [ ] Migration sudah jalan (table sudah ada)
- [ ] Seed sudah jalan (data sudah ada)
- [ ] Website menampilkan produk
- [ ] API `/api/landing` return data
- [ ] Sponsor logos tampil di footer

## Next Deployment

Untuk deployment berikutnya:
1. Auto-seed akan cek database
2. Jika sudah ada data → skip seed
3. Jika kosong → auto seed
4. Deployment tetap sukses meski seed gagal

---

**Dibuat**: 2026-03-10
**Status**: Ready to fix
