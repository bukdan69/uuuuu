import { db } from '../src/lib/db';

async function seedCreditPackages() {
  console.log('Seeding credit packages...');

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
    const existing = await db.creditPackage.findFirst({
      where: { name: pkg.name },
    });

    if (existing) {
      console.log(`Package "${pkg.name}" already exists, updating...`);
      await db.creditPackage.update({
        where: { id: existing.id },
        data: pkg,
      });
    } else {
      console.log(`Creating package "${pkg.name}"...`);
      await db.creditPackage.create({
        data: pkg,
      });
    }
  }

  console.log('Credit packages seeded successfully!');
}

seedCreditPackages()
  .catch((error) => {
    console.error('Error seeding credit packages:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
