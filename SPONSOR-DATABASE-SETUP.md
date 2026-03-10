# Sponsor Database Setup

## Overview

Logo sponsor sekarang disimpan di database dan ditampilkan secara dinamis dari API.

## Files Created/Modified

### 1. Database Seed Script
- **File**: `scripts/seed-sponsors.ts`
- **Purpose**: Seed data sponsor BUMN dan institusi pemerintah ke database
- **Usage**: `npx tsx scripts/seed-sponsors.ts`

### 2. API Endpoint
- **File**: `src/app/api/sponsors/route.ts`
- **Endpoint**: `GET /api/sponsors`
- **Returns**: Array of active sponsors ordered by sortOrder

### 3. Component Update
- **File**: `src/components/landing/SponsorLogos.tsx`
- **Changes**: 
  - Fetch sponsors from API instead of hardcoded array
  - Added loading state with skeleton
  - Dynamic rendering based on database data

## Sponsors in Database

1. **Bank Indonesia** - Lembaga Negara
2. **Otoritas Jasa Keuangan (OJK)** - Lembaga Negara
3. **Danantara Indonesia** - Holding BUMN
4. **BUMN Untuk Indonesia** - BUMN
5. **Kementerian UMKM** - Kementerian
6. **Pertamina** - BUMN Energi
7. **Bank Negara Indonesia (BNI)** - Bank BUMN
8. **PLN** - BUMN Energi
9. **Kereta Api Indonesia (KAI)** - BUMN Transportasi

## How to Update Sponsors

### Add New Sponsor
```typescript
await prisma.sponsor.create({
  data: {
    name: 'Sponsor Name',
    logoUrl: 'https://example.com/logo.png',
    category: 'Category',
    website: 'https://example.com',
    sortOrder: 10,
    isActive: true,
  },
});
```

### Deactivate Sponsor
```typescript
await prisma.sponsor.update({
  where: { id: 'sponsor-id' },
  data: { isActive: false },
});
```

### Change Order
```typescript
await prisma.sponsor.update({
  where: { id: 'sponsor-id' },
  data: { sortOrder: 5 },
});
```

## Database Schema

```prisma
model Sponsor {
  id        String   @id @default(cuid())
  name      String
  logoUrl   String
  website   String
  category  String
  isActive  Boolean  @default(true)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([isActive, sortOrder])
  @@map("sponsors")
}
```

## Benefits

✅ **Dynamic Content**: Sponsors can be updated without code changes
✅ **Database Driven**: All sponsor data stored in database
✅ **Easy Management**: Add/remove/reorder sponsors via database
✅ **Active Control**: Enable/disable sponsors with isActive flag
✅ **Ordered Display**: Control display order with sortOrder field

## Testing

1. Run seed script: `npx tsx scripts/seed-sponsors.ts`
2. Start dev server: `npm run dev`
3. Visit homepage: `http://localhost:3000`
4. Verify sponsors carousel displays correctly

## API Response Example

```json
[
  {
    "id": "clx123abc",
    "name": "Bank Indonesia",
    "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/3/39/BI_Logo.png",
    "website": "https://www.bi.go.id",
    "category": "Lembaga Negara",
    "isActive": true,
    "sortOrder": 1
  },
  ...
]
```
