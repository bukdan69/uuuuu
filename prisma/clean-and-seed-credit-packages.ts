import { db } from '../src/lib/db';

async function cleanAndSeedCreditPackages() {
  console.log('Cleaning existing credit packages...');

  // Delete all existing packages
  const deleted = await db.creditPackage.deleteMany({});
  console.log(`Deleted ${deleted.count} existing packages\n`);

  console.log('Seeding new credit packages...');

  const packages = [
    {
      name: 'Paket Starter',
      credits: 50,
      price: 50000,
      bonusCredits: 0,
      isActive: true,
      sortOrder: 0,
    },
    {
      name: 'Paket Popular',
      credits: 150,
      price: 135000,
      bonusCredits: 15,
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Paket Business',
      credits: 300,
      price: 255000,
      bonusCredits: 45,
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Paket Enterprise',
      credits: 1000,
      price: 800000,
      bonusCredits: 200,
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const pkg of packages) {
    console.log(`Creating package "${pkg.name}"...`);
    await db.creditPackage.create({
      data: pkg,
    });
    console.log(`  ✓ ${pkg.credits} credits + ${pkg.bonusCredits} bonus = Rp ${pkg.price.toLocaleString('id-ID')}`);
  }

  console.log('\n✅ Credit packages cleaned and seeded successfully!');
  
  // Verify
  const allPackages = await db.creditPackage.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  
  console.log(`\nTotal packages in database: ${allPackages.length}`);
  allPackages.forEach((pkg, index) => {
    console.log(`${index + 1}. ${pkg.name}: ${pkg.credits} + ${pkg.bonusCredits} bonus = Rp ${pkg.price.toLocaleString('id-ID')}`);
  });
}

cleanAndSeedCreditPackages()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
