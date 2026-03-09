import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding sample listings...');

  // Get or create a test user
  let testUser = await prisma.profile.findFirst({
    where: { email: { contains: '@' } }
  });

  if (!testUser) {
    console.log('⚠️  No users found. Please login first via Google OAuth.');
    console.log('   Visit: http://localhost:3000/auth');
    return;
  }

  console.log(`✅ Using user: ${testUser.name} (${testUser.email})`);

  // Get categories
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    take: 5
  });

  if (categories.length === 0) {
    console.log('⚠️  No categories found. Run seed-categories.ts first!');
    return;
  }

  const sampleListings = [
    {
      title: 'iPhone 15 Pro Max 256GB Like New',
      description: 'iPhone 15 Pro Max warna Natural Titanium, kondisi mulus seperti baru. Fullset dengan box, charger, dan kabel original. Garansi resmi iBox masih 10 bulan. Tidak ada lecet atau cacat. Dijual karena upgrade ke model terbaru.',
      price: 18500000,
      condition: 'like_new',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
    },
    {
      title: 'Laptop ASUS ROG Strix G15 RTX 3060',
      description: 'Gaming laptop ASUS ROG Strix G15 dengan spesifikasi:\n- Processor: AMD Ryzen 7 5800H\n- GPU: NVIDIA RTX 3060 6GB\n- RAM: 16GB DDR4\n- Storage: 512GB NVMe SSD\n- Display: 15.6" FHD 144Hz\n\nKondisi sangat terawat, jarang dipakai. Cocok untuk gaming dan editing.',
      price: 15000000,
      condition: 'good',
      city: 'Bandung',
      province: 'Jawa Barat',
    },
    {
      title: 'Sony A7 III Body Only Fullset',
      description: 'Kamera mirrorless Sony A7 III body only, fullset dengan box dan aksesoris lengkap. Shutter count masih rendah sekitar 5000. Kondisi fisik dan fungsi 100% normal. Sensor bersih tanpa jamur. Cocok untuk fotografi profesional dan videografi.',
      price: 22000000,
      condition: 'like_new',
      city: 'Surabaya',
      province: 'Jawa Timur',
    },
    {
      title: 'Samsung Smart TV 55 Inch 4K UHD',
      description: 'Smart TV Samsung 55 inch dengan resolusi 4K UHD. Fitur lengkap dengan HDR, Smart Hub, dan koneksi WiFi. Kondisi mulus tanpa dead pixel. Sudah termasuk bracket dinding. Dijual karena pindah rumah.',
      price: 7500000,
      condition: 'good',
      city: 'Semarang',
      province: 'Jawa Tengah',
    },
    {
      title: 'Sepeda Lipat Polygon Urbano 3.0',
      description: 'Sepeda lipat Polygon Urbano 3.0 warna hitam. Kondisi terawat, baru pakai 3 bulan. Sudah upgrade sadel dan pedal. Cocok untuk commuting dan olahraga. Lengkap dengan lampu depan belakang dan bel.',
      price: 3500000,
      condition: 'like_new',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
    },
  ];

  for (let i = 0; i < sampleListings.length; i++) {
    const data = sampleListings[i];
    const category = categories[i % categories.length];

    // Generate slug
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

    const listing = await prisma.listing.create({
      data: {
        userId: testUser.userId,
        categoryId: category.id,
        title: data.title,
        slug,
        description: data.description,
        price: data.price,
        priceType: 'negotiable',
        listingType: 'sale',
        condition: data.condition,
        status: 'active',
        city: data.city,
        province: data.province,
        publishedAt: new Date(),
        viewCount: Math.floor(Math.random() * 100),
        favoriteCount: Math.floor(Math.random() * 20),
      },
    });

    console.log(`✅ Created: ${listing.title}`);

    // Update category listing count
    await prisma.category.update({
      where: { id: category.id },
      data: { listingCount: { increment: 1 } },
    });
  }

  // Update user's listing count
  await prisma.profile.update({
    where: { userId: testUser.userId },
    data: {
      totalListings: { increment: sampleListings.length },
      activeListings: { increment: sampleListings.length },
    },
  });

  console.log('✨ Seeding completed!');
  console.log(`📊 Created ${sampleListings.length} sample listings`);
  console.log('🌐 Visit: http://localhost:3000/marketplace');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding listings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
