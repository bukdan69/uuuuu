import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAndSeedCategories() {
  console.log('🔄 RESET AND SEED CATEGORIES\n');
  console.log('This will:');
  console.log('1. Delete ALL existing categories');
  console.log('2. Seed 40 new categories with icons & colors');
  console.log('3. Create ~240 subcategories\n');

  try {
    // Step 1: Delete all existing categories
    console.log('🗑️  Step 1: Deleting all existing categories...');
    
    // Delete all subcategories first (where parentId is not null)
    const deletedSubs = await prisma.category.deleteMany({
      where: { parentId: { not: null } }
    });
    console.log(`   ✅ Deleted ${deletedSubs.count} subcategories`);

    // Delete all parent categories
    const deletedParents = await prisma.category.deleteMany({
      where: { parentId: null }
    });
    console.log(`   ✅ Deleted ${deletedParents.count} parent categories\n`);

    // Step 2: Run seed script
    console.log('🌱 Step 2: Seeding new categories...\n');
    
    // Import and run the seed function
    const { execSync } = require('child_process');
    execSync('npx tsx prisma/seed-categories.ts', { stdio: 'inherit' });

    console.log('\n✨ Reset and seed completed successfully!\n');

    // Step 3: Verify results
    console.log('🔍 Step 3: Verifying results...\n');
    execSync('npx tsx check-categories.ts', { stdio: 'inherit' });

  } catch (error) {
    console.error('❌ Error during reset and seed:', error);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Make sure no listings are using categories');
    console.log('   2. Check foreign key constraints in Listing model');
    console.log('   3. Run: npx prisma generate');
    console.log('   4. Try manual cleanup first');
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSeedCategories();
