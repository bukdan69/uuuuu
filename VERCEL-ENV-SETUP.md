# Setup Environment Variables di Vercel

## Step-by-Step Guide

### Step 1: Buka Vercel Dashboard

1. Buka browser
2. Pergi ke: https://vercel.com/dashboard
3. Login dengan akun Anda

### Step 2: Pilih Project

1. Di dashboard, cari project: **aaaaaaaaam**
2. Klik project tersebut

### Step 3: Buka Settings

1. Di halaman project, klik tab **Settings** (di bagian atas)
2. Di sidebar kiri, klik **Environment Variables**

### Step 4: Tambah DATABASE_URL

**Di form "Add Environment Variable":**

**Key:**
```
DATABASE_URL
```

**Value:**
```
postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Penjelasan:**
- `postgresql://` = Protocol (BUKAN `https://`)
- `postgres.rdnbvknftxyddjtxbsgc` = Username
- `Bukdan%23kubang101` = Password (# di-encode jadi %23)
- `aws-1-ap-southeast-1.pooler.supabase.com` = Host (region aws-1, BUKAN aws-0)
- `6543` = Port (connection pooling)
- `?pgbouncer=true` = Connection pooling enabled

**Klik Save**

### Step 5: Tambah DIRECT_URL

**Di form "Add Environment Variable" yang baru:**

**Key:**
```
DIRECT_URL
```

**Value:**
```
postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Penjelasan:**
- Sama seperti DATABASE_URL
- Tapi port `5432` (direct connection, bukan pooling)
- Tanpa `?pgbouncer=true`

**Klik Save**

### Step 6: Verifikasi

Setelah save, Anda akan melihat:

```
✓ DATABASE_URL
✓ DIRECT_URL
```

Kedua variable sudah tersimpan.

### Step 7: Redeploy

1. Klik tab **Deployments** (di bagian atas)
2. Cari deployment terbaru (paling atas)
3. Klik **...** (tiga titik) di sebelah kanan
4. Pilih **Redeploy**
5. Tunggu deployment selesai (biasanya 2-5 menit)

### Step 8: Verifikasi Deployment

Setelah deployment selesai:

1. Klik deployment yang baru
2. Lihat status: harus **Ready** (bukan Error)
3. Buka website: https://aaaaaaaaam.vercel.app/
4. Harus tampil produk dan kategori

## Contoh Screenshot

### Form Add Environment Variable

```
┌─────────────────────────────────────────────────────────┐
│ Add Environment Variable                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Key:                                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ DATABASE_URL                                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Value:                                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%2│ │
│ │ 3kubang101@aws-1-ap-southeast-1.pooler.supabase.co│ │
│ │ m:6543/postgres?pgbouncer=true                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [Save]                                                  │
└─────────────────────────────────────────────────────────┘
```

### Environment Variables List

```
┌─────────────────────────────────────────────────────────┐
│ Environment Variables                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ✓ DATABASE_URL                                          │
│   postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%2...│
│   [Edit] [Delete]                                       │
│                                                         │
│ ✓ DIRECT_URL                                            │
│   postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%2...│
│   [Edit] [Delete]                                       │
│                                                         │
│ [+ Add Another]                                         │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Error: "Failed to fetch landing data"

**Penyebab**: Environment variables belum di-set atau salah

**Solusi**:
1. Cek DATABASE_URL dan DIRECT_URL sudah ada
2. Pastikan format `postgresql://` (bukan `https://`)
3. Pastikan region `aws-1` (bukan `aws-0`)
4. Redeploy

### Error: "FATAL: Tenant or user not found"

**Penyebab**: Kredensial database salah

**Solusi**:
1. Cek username: `postgres.rdnbvknftxyddjtxbsgc`
2. Cek password: `Bukdan%23kubang101` (# = %23)
3. Cek host: `aws-1-ap-southeast-1.pooler.supabase.com`

### Deployment masih Error setelah redeploy

**Solusi**:
1. Tunggu 5 menit (cache mungkin belum clear)
2. Refresh browser (Ctrl+F5)
3. Cek Vercel logs untuk error detail

## Verifikasi Final

Setelah redeploy, test:

### 1. Test Website
```
https://aaaaaaaaam.vercel.app/
```
Harus tampil:
- ✅ Produk di listings section
- ✅ Kategori
- ✅ Sponsor logos

### 2. Test API
```bash
curl https://aaaaaaaaam.vercel.app/api/landing
```
Harus return JSON dengan data (bukan error)

### 3. Test Database
```bash
$env:DATABASE_URL="postgresql://..."
npx tsx scripts/check-production-data.ts
```
Harus tampil:
- ✅ 10 listings
- ✅ 7 categories
- ✅ 3 users

## Checklist

- [ ] DATABASE_URL sudah di-set di Vercel
- [ ] DIRECT_URL sudah di-set di Vercel
- [ ] Format `postgresql://` (bukan `https://`)
- [ ] Region `aws-1` (bukan `aws-0`)
- [ ] Redeploy sudah dilakukan
- [ ] Deployment status: Ready
- [ ] Website menampilkan produk
- [ ] API return data (bukan error)

---

**Dibuat**: 2026-03-10
**Status**: Ready to implement
