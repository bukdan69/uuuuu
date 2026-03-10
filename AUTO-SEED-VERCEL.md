# Auto-Seed untuk Vercel Deployment

## 📋 Ringkasan

Script otomatis untuk seed data produk dan user saat deployment di Vercel. Script ini berjalan otomatis setelah build selesai dan aman untuk dijalankan berulang kali.

## 🎯 Fitur

- ✅ **Otomatis**: Berjalan setelah `npm run build` selesai
- ✅ **Aman**: Cek database sebelum seed (tidak duplikat data)
- ✅ **Idempoten**: Bisa dijalankan berulang kali tanpa masalah
- ✅ **Non-blocking**: Tidak gagalkan deployment jika seed error
- ✅ **Minimal**: Hanya seed data penting untuk production

## 🚀 Cara Kerja

### 1. Otomatis di Vercel

Saat deployment di Vercel:

```bash
# Vercel menjalankan:
npm run build

# Yang akan menjalankan:
next build                              # Build aplikasi
npx tsx scripts/auto-seed-vercel.ts    # Auto-seed (postbuild)
```

### 2. Proses Auto-Seed

Script akan:

1. **Cek koneksi database**
   - Pastikan bisa connect ke production database
   
2. **Cek data existing**
   - Hitung jumlah listings, categories, users
   - Jika sudah ada data → skip seed
   - Jika kosong → lanjut seed

3. **Seed data minimal**
   - 7 categories (Elektronik, Fashion, Properti, dll)
   - 3 users (1 admin, 2 penjual)
   - 10 listings (produk sample)
   - 9 sponsors (BUMN dan institusi pemerintah)

4. **Log hasil**
   - Tampilkan summary di Vercel build log
   - Jika error → log warning tapi tetap lanjut deployment

## 📦 Data yang Di-seed

### Categories (7)
- Elektronik
- Fashion
- Properti
- Kendaraan
- Makanan & Minuman
- Handmade & Craft
- UMKM

### Users (3)
- **Admin**: admin@marketplace.com (role: admin)
- **Seller 1**: seller1@marketplace.com (role: penjual)
- **Seller 2**: seller2@marketplace.com (role: penjual)

### Listings (10)
- iPhone 15 Pro Max 256GB - Rp 21.999.000
- MacBook Pro M3 14 inch - Rp 32.999.000
- Samsung Galaxy S24 Ultra - Rp 19.999.000
- Kemeja Batik Premium Pria - Rp 350.000
- Dress Wanita Elegant - Rp 450.000
- Sepatu Sneakers Original - Rp 1.250.000
- Honda CBR 150R 2023 - Rp 35.000.000
- Tas Rotan Handmade Premium - Rp 275.000
- Kopi Arabika Premium 1kg - Rp 180.000
- Batik Tulis Madura Asli - Rp 850.000

### Sponsors (9)
- Bank Indonesia
- OJK
- Danantara Indonesia
- BUMN Untuk Indonesia
- Kementerian UMKM
- Pertamina
- BNI
- PLN
- KAI

## 🔧 Manual Seed (Opsional)

Jika ingin seed manual atau seed lebih banyak data:

### Seed Minimal (10 listings)
```bash
# Set production DATABASE_URL
$env:DATABASE_URL="postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Run auto-seed script
npx tsx scripts/auto-seed-vercel.ts
```

### Seed Lengkap (25+ listings)
```bash
# Set production DATABASE_URL
$env:DATABASE_URL="postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Run full seed
npx tsx prisma/seed.ts
```

## 📊 Verifikasi Seed

### 1. Cek Vercel Build Log

Di Vercel dashboard → Deployments → [Latest] → Build Logs:

```
🌱 Auto-Seed for Vercel Deployment
════════════════════════════════════════════════════════════
🔌 Connecting to database...
✅ Connected successfully

🔍 Checking if database needs seeding...
   Listings: 0
   Categories: 0
   Users: 0

🚀 Database is empty - starting seed process...

📂 Creating categories...
✅ Created 7 categories

👥 Creating users...
✅ Created 3 users (1 admin, 2 sellers)

📦 Creating listings...
✅ Created 10 listings

🏢 Creating sponsors...
✅ Created 9 sponsors

════════════════════════════════════════════════════════════
🎉 Auto-seed completed successfully!
```

### 2. Cek API Endpoint

```bash
# Test API
curl https://aaaaaaaaam.vercel.app/api/landing

# Harus return:
{
  "listings": [...],  # 10 listings
  "categories": [...], # 7 categories
  "sponsors": [...]    # 9 sponsors
}
```

### 3. Cek Homepage

Buka: https://aaaaaaaaam.vercel.app/

Harus tampil:
- ✅ 10 produk di listings section
- ✅ 7 kategori di category section
- ✅ 9 sponsor logos di footer

## 🔄 Re-deployment

Saat re-deploy (push code baru):

```
🔍 Checking if database needs seeding...
   Listings: 10
   Categories: 7
   Users: 3

✅ Database already has data - skipping seed
   (This is normal for redeployments)
```

Script akan skip seed karena data sudah ada. Ini normal dan expected.

## ⚠️ Troubleshooting

### Seed Tidak Jalan

**Cek Vercel Environment Variables:**

1. Buka Vercel Dashboard
2. Project Settings → Environment Variables
3. Pastikan ada:
   - `DATABASE_URL` = production database URL
   - `DIRECT_URL` = production direct URL

### Seed Error Tapi Deployment Sukses

Ini normal! Script di-design untuk tidak gagalkan deployment.

**Solusi:**
1. Cek error di build log
2. Fix error (biasanya connection issue)
3. Seed manual:
   ```bash
   $env:DATABASE_URL="..."
   npx tsx scripts/auto-seed-vercel.ts
   ```

### Database Sudah Ada Data Tapi Ingin Re-seed

**Opsi 1: Clear database dulu**
```sql
-- Di Supabase SQL Editor
TRUNCATE TABLE listings CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE profiles CASCADE;
TRUNCATE TABLE sponsors CASCADE;
```

**Opsi 2: Seed manual dengan force**
```bash
# Edit script, comment out check
npx tsx scripts/auto-seed-vercel.ts
```

## 📝 File Terkait

- `scripts/auto-seed-vercel.ts` - Script auto-seed
- `package.json` - Config postbuild hook
- `prisma/seed.ts` - Full seed script (manual)
- `CARA-SEED-PRODUCTION.md` - Panduan seed manual

## 🎯 Best Practices

1. **Development**: Gunakan database lokal/dev
2. **Production**: Biarkan auto-seed handle seeding
3. **Re-seed**: Hanya jika benar-benar perlu
4. **Data besar**: Seed manual setelah deployment

## 📞 Support

Jika ada masalah:
1. Cek Vercel build logs
2. Cek Supabase logs
3. Test connection manual
4. Seed manual jika perlu

---

**Dibuat**: 2026-03-10
**Update terakhir**: 2026-03-10
