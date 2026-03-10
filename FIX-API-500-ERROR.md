# Fix: API 500 Error - Failed to fetch landing data

## Problem

API endpoint `/api/landing` return 500 error dengan message "Failed to fetch landing data" meskipun database sudah ada data.

## Root Cause

Kemungkinan:
1. **Prisma Client tidak bisa connect ke database** di Vercel
2. **Environment variables salah** di Vercel
3. **Database URL tidak accessible** dari Vercel

## Solution

### Step 1: Verify Vercel Environment Variables

1. Buka Vercel Dashboard: https://vercel.com/dashboard
2. Pilih project: `aaaaaaaaam`
3. Settings → Environment Variables
4. Pastikan ada:

```
DATABASE_URL=postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**PENTING**: 
- Gunakan `postgresql://` bukan `https://`
- Gunakan region `aws-1` bukan `aws-0`
- Password: `Bukdan%23kubang101` (# = %23)

### Step 2: Redeploy

1. Vercel Dashboard → Deployments
2. Klik deployment terbaru
3. Klik "..." → Redeploy

### Step 3: Check Vercel Logs

1. Vercel Dashboard → Deployments → Latest
2. Klik "Runtime Logs"
3. Cari error message untuk debug

### Step 4: Manual Test

Setelah redeploy, test API:

```bash
curl https://aaaaaaaaam.vercel.app/api/landing
```

Harus return JSON dengan data, bukan error.

## Troubleshooting

### Error: "Failed to fetch landing data"

**Penyebab**: Database connection error

**Solusi**:
1. Cek environment variables di Vercel
2. Pastikan DATABASE_URL dan DIRECT_URL benar
3. Redeploy

### Error: "FATAL: Tenant or user not found"

**Penyebab**: Kredensial database salah

**Solusi**:
1. Cek username: `postgres.rdnbvknftxyddjtxbsgc`
2. Cek password: `Bukdan%23kubang101`
3. Cek region: `aws-1-ap-southeast-1`

### Error: "connect ECONNREFUSED"

**Penyebab**: Database tidak accessible dari Vercel

**Solusi**:
1. Cek Supabase firewall settings
2. Pastikan database public accessible
3. Cek connection pooling settings

## Verification

Setelah fix, test:

1. **API Test**:
```bash
curl https://aaaaaaaaam.vercel.app/api/landing
```

2. **Website Test**:
Buka https://aaaaaaaaam.vercel.app/
Harus tampil produk dan kategori

3. **Database Test**:
```bash
$env:DATABASE_URL="postgresql://..."
npx tsx scripts/check-production-data.ts
```

---

**Status**: Pending fix
**Next**: Check Vercel logs and environment variables
