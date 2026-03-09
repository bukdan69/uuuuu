# Seed Kategori & Subkategori

## Struktur Kategori

Database marketplace ini memiliki **25 kategori utama** dengan **150+ subkategori** yang mencakup:

### Kategori Utama dengan Icon & Warna:

1. **Elektronik** - ⚡ Zap (Blue #3B82F6)
2. **Handphone & Aksesoris** - 📱 Smartphone (Purple #8B5CF6)
3. **Komputer & Aksesoris** - 🖥️ Monitor (Cyan #06B6D4)
4. **Kamera** - 📷 Camera (Pink #EC4899)
5. **TV & Home Entertainment** - 📺 Tv (Amber #F59E0B)
6. **Peralatan Rumah Tangga** - 🏠 Home (Emerald #10B981)
7. **Rumah & Dekorasi** - 🛋️ Sofa (Red #EF4444)
8. **Dapur** - 👨‍🍳 ChefHat (Orange #F97316)
9. **Makanan & Minuman** - 🍴 UtensilsCrossed (Lime #84CC16)
10. **Kesehatan** - ❤️ Heart (Teal #14B8A6)
11. **Kecantikan** - ✨ Sparkles (Purple #A855F7)
12. **Perawatan Pria** - 👤 User (Indigo #6366F1)
13. **Ibu & Bayi** - 👶 Baby (Pink #F472B6)
14. **Fashion Wanita** - 👕 Shirt (Pink #EC4899)
15. **Fashion Pria** - 👔 ShirtIcon (Sky Blue #0EA5E9)
16. **Fashion Muslim** - 🌙 Moon (Green #059669)
17. **Sepatu Wanita** - 👣 Footprints (Fuchsia #D946EF)
18. **Sepatu Pria** - 👣 Footprints (Blue #0284C7)
19. **Tas Wanita** - 🛍️ ShoppingBag (Pink #DB2777)
20. **Tas Pria** - 💼 Briefcase (Cyan #0891B2)
21. **Jam Tangan** - ⌚ Watch (Violet #7C3AED)
22. **Olahraga & Outdoor** - 🏋️ Dumbbell (Red #DC2626)
23. **Otomotif** - 🚗 Car (Orange #EA580C)
24. **Hobi & Koleksi** - 🎮 Gamepad2 (Violet #7C3AED)
25. **Buku & Alat Tulis** - 📖 BookOpen (Yellow #CA8A04)

## Cara Menjalankan Seed

### 0. Update Database Schema (PENTING!)

Sebelum menjalankan seed, update schema database terlebih dahulu:

```bash
npx prisma db push
```

atau jika menggunakan migration:

```bash
npx prisma migrate dev --name add_category_icon_color
```

### 1. Menggunakan ts-node (Recommended)

```bash
npx ts-node prisma/seed-categories.ts
```

### 2. Menggunakan tsx

```bash
npx tsx prisma/seed-categories.ts
```

### 3. Compile dulu baru jalankan

```bash
npx tsc prisma/seed-categories.ts
node prisma/seed-categories.js
```

## Fitur Seed Script

- ✅ **Upsert**: Tidak akan duplikat jika dijalankan berkali-kali
- ✅ **Relasi Parent-Child**: Subkategori otomatis terhubung dengan kategori induk
- ✅ **Slug Unique**: Setiap kategori memiliki slug unik untuk URL
- ✅ **Active by Default**: Semua kategori aktif secara default
- ✅ **Listing Count**: Inisialisasi counter untuk jumlah listing

## Struktur Database

```typescript
Category {
  id: string
  name: string
  slug: string (unique)
  description: string?
  icon: string? (Lucide icon name)
  color: string? (Hex color code)
  iconUrl: string?
  imageBannerUrl: string?
  parentId: string? (untuk subkategori)
  isActive: boolean
  listingCount: int
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Fitur Icon & Color

Setiap kategori utama memiliki:
- **Icon**: Nama icon dari Lucide React (e.g., "Zap", "Smartphone", "Camera")
- **Color**: Kode warna hex (e.g., "#3B82F6", "#8B5CF6")

Icon dan warna ini bisa digunakan untuk:
- Badge kategori yang colorful
- Menu navigasi dengan icon
- Filter sidebar dengan visual menarik
- Card kategori di homepage

## Contoh Penggunaan di Form

Setelah seed berhasil, form listing akan menampilkan:

1. **Dropdown Kategori**: 25 kategori utama
2. **Dropdown Subkategori**: Muncul setelah kategori dipilih (conditional)
3. **Filter Marketplace**: Kategori bisa digunakan untuk filter

## Verifikasi

Setelah seed berhasil, cek di database:

```sql
-- Cek jumlah kategori utama
SELECT COUNT(*) FROM "Category" WHERE "parentId" IS NULL;
-- Hasil: 25

-- Cek jumlah subkategori
SELECT COUNT(*) FROM "Category" WHERE "parentId" IS NOT NULL;
-- Hasil: 150

-- Cek total
SELECT COUNT(*) FROM "Category";
-- Hasil: 175
```

## Update Seed

Jika ingin menambah/mengubah kategori:

1. Edit file `prisma/seed-categories.ts`
2. Jalankan ulang seed script
3. Script akan update data yang sudah ada (upsert)

## Catatan

- Slug harus unique dan SEO-friendly
- Nama kategori menggunakan Bahasa Indonesia
- Struktur mengikuti standar marketplace Indonesia (Tokopedia, Shopee, Bukalapak)
- Setiap kategori utama memiliki 6 subkategori untuk konsistensi
