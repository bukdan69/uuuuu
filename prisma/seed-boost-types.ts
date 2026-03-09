import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding boost types...');

  // Seed Boost Types
  const boostTypes = [
    {
      type: 'highlight',
      name: 'Highlight Boost',
      description: 'Tampilkan iklan dengan highlight khusus',
      creditsPerDay: 5,
      multiplier: 1.5,
      isActive: true,
    },
    {
      type: 'top_search',
      name: 'Top Search Boost',
      description: 'Tampilkan iklan di bagian atas hasil pencarian',
      creditsPerDay: 10,
      multiplier: 2.0,
      isActive: true,
    },
    {
      type: 'premium',
      name: 'Premium Boost',
      description: 'Tampilkan iklan di section premium homepage',
      creditsPerDay: 15,
      multiplier: 3.0,
      isActive: true,
    },
  ];

  for (const boostType of boostTypes) {
    await prisma.boostType.upsert({
      where: { type: boostType.type },
      update: boostType,
      create: boostType,
    });
    console.log(`✅ Created/Updated boost type: ${boostType.name}`);
  }

  // Seed Platform Settings
  const platformSettings = [
    {
      key: 'premium_homepage_count',
      value: JSON.stringify({ amount: 6 }),
      description: 'Jumlah card premium di homepage',
    },
    {
      key: 'initial_credit_bonus',
      value: JSON.stringify({ amount: 100 }),
      description: 'Bonus kredit untuk user baru',
    },
    {
      key: 'referral_credit_bonus',
      value: JSON.stringify({ amount: 50 }),
      description: 'Bonus kredit untuk referral',
    },
  ];

  for (const setting of platformSettings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
      },
      create: setting,
    });
    console.log(`✅ Created/Updated platform setting: ${setting.key}`);
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
