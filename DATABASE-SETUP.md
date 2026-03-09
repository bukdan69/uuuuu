# Setup Database & Seed Data

## Langkah-langkah Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Push Schema ke Database

```bash
npx prisma db push
```

### 4. Cek Koneksi Database

```bash
npx ts-node check-database.ts
```

Output akan menampilkan:
- Jumlah kategori
- Jumlah listings
- Jumlah users
- Status koneksi database

### 5. Seed Kategori (Wajib!)

```bash
npx ts-node prisma/seed-categories.ts
```

Ini akan membuat:
- 25 kategori utama dengan icon & warna
- 150 subkategori

### 6. Seed Sample Listings (Opsional)

Setelah login via Google OAuth, jalankan:

```bash
npx ts-node prisma/seed-sample-listings.ts
```

Ini akan membuat 5 sample listings untuk testing.

## Troubleshooting

### Error: 'next' is not recognized

```bash
# Hapus node_modules dan install ulang
rm -rf node_modules
npm install
```

### Error: Database connection failed

1. Cek file `.env` - pastikan `DATABASE_URL` benar
2. Cek koneksi internet
3. Cek Supabase dashboard - pastikan database aktif

### Tidak ada produk di marketplace

1. Login dulu via Google OAuth: `http://localhost:3000/auth`
2. Jalankan seed categories: `npx ts-node prisma/seed-categories.ts`
3. Jalankan seed listings: `npx ts-node prisma/seed-sample-listings.ts`
4. Atau buat listing manual: `http://localhost:3000/listing/create`

### Error: Prisma Client not generated

```bash
npx prisma generate
```

## Urutan Lengkap (Fresh Install)

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Push schema
npx prisma db push

# 4. Cek database
npx ts-node check-database.ts

# 5. Seed categories
npx ts-node prisma/seed-categories.ts

# 6. Login via browser
# Buka: http://localhost:3000/auth

# 7. Seed sample listings (setelah login)
npx ts-node prisma/seed-sample-listings.ts

# 8. Start dev server
npm run dev
```

## Verifikasi

Setelah semua selesai, cek:

1. **Marketplace**: `http://localhost:3000/marketplace`
   - Harus ada 5 sample listings
   - Filter kategori harus muncul

2. **Admin Listings**: `http://localhost:3000/admin/listings`
   - Harus ada 5 listings
   - Status: Active

3. **Create Listing**: `http://localhost:3000/listing/create`
   - Dropdown kategori harus ada 25 kategori
   - Dropdown subkategori muncul setelah pilih kategori

## Database Info

- **Provider**: PostgreSQL (Supabase)
- **Connection**: Pooler (port 6543)
- **Direct**: Port 5432
- **Location**: AWS Singapore (ap-southeast-1)

## Seed Scripts

| Script | Fungsi | Wajib? |
|--------|--------|--------|
| `seed-categories.ts` | Buat 25 kategori + 150 subkategori | ✅ Ya |
| `seed-sample-listings.ts` | Buat 5 sample listings | ❌ Opsional |
| `seed-regions-full.ts` | Data provinsi/kota Indonesia | ✅ Ya (untuk KYC) |
| `seed-credit-packages.ts` | Paket kredit | ❌ Opsional |
| `seed-boost-types.ts` | Tipe boost iklan | ❌ Opsional |

## Tips

- Jalankan `check-database.ts` kapan saja untuk cek status database
- Seed scripts bisa dijalankan berkali-kali (upsert)
- Backup database sebelum testing: Supabase Dashboard > Database > Backups
