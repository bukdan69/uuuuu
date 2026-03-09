# Credit Packages Integration

## Overview
Integrasi lengkap antara halaman admin credit management (`/admin/credits`) dengan halaman public credit packages (`/credits`).

## Architecture

### Database
- Model: `CreditPackage` di `prisma/schema.prisma`
- Fields:
  - `id`: String (cuid)
  - `name`: String (nama paket)
  - `credits`: Int (jumlah kredit)
  - `price`: Float (harga dalam IDR)
  - `bonusCredits`: Int (bonus kredit)
  - `isActive`: Boolean (status aktif/nonaktif)
  - `sortOrder`: Int (urutan tampilan)
  - `createdAt`, `updatedAt`: DateTime

### API Endpoints

#### 1. GET `/api/admin/credit-packages`
Fetch semua credit packages (admin & public)

**Query Parameters:**
- `active=true` - Filter hanya paket aktif (untuk public page)

**Response:**
```json
{
  "packages": [
    {
      "id": "...",
      "name": "Paket Starter",
      "credits": 50,
      "price": 50000,
      "bonusCredits": 0,
      "isActive": true,
      "sortOrder": 0,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### 2. POST `/api/admin/credit-packages`
Create new credit package (admin only)

**Headers:**
- `Authorization: Bearer {userId}` (admin user ID)

**Body:**
```json
{
  "name": "Paket Baru",
  "credits": 100,
  "price": 100000,
  "bonusCredits": 10,
  "isActive": true,
  "sortOrder": 4
}
```

#### 3. PATCH `/api/admin/credit-packages`
Update existing credit package (admin only)

**Headers:**
- `Authorization: Bearer {userId}` (admin user ID)

**Body:**
```json
{
  "id": "package-id",
  "name": "Paket Updated",
  "credits": 150,
  "price": 120000,
  "bonusCredits": 15,
  "isActive": true,
  "sortOrder": 1
}
```

### Pages

#### 1. Admin Page: `/admin/credits`
**Features:**
- View all credit packages
- Create new packages
- Edit existing packages
- Toggle active/inactive status
- View credit transactions
- Stats cards (total transactions, credits in/out, net credits)

**Components:**
- Tabs: "Paket Kredit" & "Transaksi"
- Create/Edit dialogs
- Stats cards with gradient backgrounds

#### 2. Public Page: `/credits`
**Features:**
- Display active credit packages from database
- User credit balance display
- Purchase buttons (online & manual transfer)
- Credit usage information
- Boost features info
- FAQ section

**Data Flow:**
1. Fetch active packages from `/api/admin/credit-packages?active=true`
2. Display packages with dynamic icons and colors
3. Show bonus credits and savings percentage
4. Handle purchase flow

## Setup Instructions

### 1. Seed Initial Data
```bash
npx tsx prisma/clean-and-seed-credit-packages.ts
```

This will:
1. Delete all existing credit packages
2. Create 4 clean packages:
   - **Paket Starter**: 50 credits, Rp 50,000
   - **Paket Popular**: 150 credits + 15 bonus, Rp 135,000 (10% savings)
   - **Paket Business**: 300 credits + 45 bonus, Rp 255,000 (13% savings)
   - **Paket Enterprise**: 1000 credits + 200 bonus, Rp 800,000 (17% savings)

### 2. Admin Access
1. Login as admin user
2. Navigate to `/admin/credits`
3. Use "Paket Kredit" tab to manage packages
4. Use "Transaksi" tab to view credit transactions

### 3. Public Access
1. Navigate to `/credits`
2. View available packages (fetched from database)
3. See user credit balance (if logged in)
4. Purchase packages

## Key Features

### Admin Features
- ✅ CRUD operations for credit packages
- ✅ Toggle package active status
- ✅ Set package sort order
- ✅ View all credit transactions
- ✅ Real-time stats dashboard
- ✅ Prisma ORM integration (no Supabase direct client)

### Public Features
- ✅ Dynamic package display from database
- ✅ User credit balance display
- ✅ Purchase flow (online & manual)
- ✅ Bonus credits calculation
- ✅ Savings percentage display
- ✅ Responsive design

## Integration Points

1. **Admin creates/updates packages** → Saved to database via Prisma
2. **Public page fetches packages** → Reads from database (active only)
3. **User purchases package** → Creates transaction & updates user credits
4. **Admin views transactions** → Displays all credit transactions

## Authentication

- Admin endpoints require admin role check via `checkAdminRole(userId)`
- Public endpoints are open (no auth required for viewing)
- Purchase endpoints require user authentication

## Notes

- All prices in Indonesian Rupiah (IDR)
- Bonus credits automatically calculated in display
- Packages sorted by `sortOrder` field
- Only active packages shown on public page
- Admin can see all packages (active & inactive)
