import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kategori yang akan dihapus (duplikat atau tidak konsisten)
const categoriesToDelete = [
  'fashion', // Duplikat, sudah ada fashion-wanita, fashion-pria, fashion-muslim
  'tas-aksesoris', // Duplikat, sudah ada tas-wanita, tas-pria
  'umkm', // Tidak spesifik, bukan kategori produk
];

async function cleanDuplicateCategories() {
  console.log('🧹 Cleaning duplicate and inconsistent categories...\n');

  try {
    for (const slug of categoriesToDelete) {
      // Find category
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          children: true,
          listings: true,
        },
      });

      if (!category) {
        console.log(`⏭️  Category "${slug}" not found, skipping...`);
        continue;
      }

      // Check if category has listings
      if (category.listings && category.listings.length > 0) {
        console.log(`⚠️  Category "${category.name}" has ${category.listings.length} listings!`);
        console.log(`   Skipping deletion to preserve data.`);
        console.log(`   Please manually reassign listings before deleting.\n`);
        continue;
      }

      // Delete subcategories first
      if (category.children && category.children.length > 0) {
        console.log(`   Deleting ${category.children.length} subcategories...`);
        for (const child of category.children) {
          await prisma.category.delete({
            where: { id: child.id },
          });
          console.log(`   ✅ Deleted subcategory: ${child.name}`);
        }
      }

      // Delete parent category
      await prisma.category.delete({
        where: { id: category.id },
      });

      console.log(`✅ Deleted category: ${category.name}\n`);
    }

    console.log('✨ Cleanup completed!');
    
    // Show summary
    const totalCategories = await prisma.category.count();
    const parentCategories = await prisma.category.count({
      where: { parentId: null }
    });
    const subCategories = await prisma.category.count({
      where: { parentId: { not: null } }
    });

    console.log('\n📊 CURRENT DATABASE STATUS:');
    console.log(`   Total Categories: ${totalCategories}`);
    console.log(`   Parent Categories: ${parentCategories}`);
    console.log(`   Subcategories: ${subCategories}\n`);

  } catch (error) {
    console.error('❌ Error cleaning categories:', error);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Make sure no listings are using these categories');
    console.log('   2. Check foreign key constraints');
    console.log('   3. Run: npx prisma generate');
  } finally {
    await prisma.$disconnect();
  }
}

cleanDuplicateCategories();
