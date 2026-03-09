import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying database tables...');

  // Check if Sponsor table exists by trying to count
  try {
    const sponsorCount = await prisma.sponsor.count();
    console.log(`✓ Sponsor table exists with ${sponsorCount} records`);
  } catch (error) {
    console.error('✗ Sponsor table check failed:', error);
  }

  // Check if CarouselConfig table exists
  try {
    const configCount = await prisma.carouselConfig.count();
    console.log(`✓ CarouselConfig table exists with ${configCount} records`);

    // Seed initial CarouselConfig if none exists
    if (configCount === 0) {
      console.log('Seeding initial CarouselConfig...');
      const config = await prisma.carouselConfig.create({
        data: {
          scrollSpeed: 20,
          pauseOnHover: true,
        },
      });
      console.log('✓ Initial CarouselConfig created:', config);
    } else {
      console.log('CarouselConfig already exists, skipping seed');
      const existingConfig = await prisma.carouselConfig.findFirst();
      console.log('Existing config:', existingConfig);
    }
  } catch (error) {
    console.error('✗ CarouselConfig table check failed:', error);
  }

  console.log('\nDatabase verification complete!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
