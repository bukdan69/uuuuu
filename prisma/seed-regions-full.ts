import { PrismaClient } from '@prisma/client';
import { 
  getProvinces, 
  getRegencies, 
  getDistricts, 
  getVillages 
} from 'idn-area-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding full Indonesia regions data from idn-area-data...');
  console.log('');

  // 1. Seed Provinces
  console.log('📍 Fetching and seeding provinces...');
  const provinces = await getProvinces();
  
  let provinceCount = 0;
  for (const province of provinces) {
    await prisma.province.upsert({
      where: { id: province.code },
      update: { name: province.name },
      create: {
        id: province.code,
        name: province.name,
      },
    });
    provinceCount++;
  }
  console.log(`✅ ${provinceCount} provinces seeded`);
  console.log('');

  // 2. Seed Regencies
  console.log('🏙️  Fetching and seeding regencies (kabupaten/kota)...');
  const regencies = await getRegencies({ transform: true });
  
  let regencyCount = 0;
  for (const regency of regencies) {
    // Determine type from name
    const type = regency.name.startsWith('KABUPATEN') 
      ? 'Kabupaten' 
      : regency.name.startsWith('KOTA') 
        ? 'Kota' 
        : 'Kabupaten';
    
    await prisma.regency.upsert({
      where: { id: regency.code },
      update: {
        name: regency.name,
        type: type,
        provinceId: regency.provinceCode,
      },
      create: {
        id: regency.code,
        name: regency.name,
        type: type,
        provinceId: regency.provinceCode,
      },
    });
    regencyCount++;
    
    // Progress indicator
    if (regencyCount % 50 === 0) {
      console.log(`   Progress: ${regencyCount} regencies...`);
    }
  }
  console.log(`✅ ${regencyCount} regencies seeded`);
  console.log('');

  // 3. Seed Districts
  console.log('🏘️  Fetching and seeding districts (kecamatan)...');
  const districts = await getDistricts({ transform: true });
  
  let districtCount = 0;
  for (const district of districts) {
    await prisma.district.upsert({
      where: { id: district.code },
      update: {
        name: district.name,
        regencyId: district.regencyCode,
      },
      create: {
        id: district.code,
        name: district.name,
        regencyId: district.regencyCode,
      },
    });
    districtCount++;
    
    // Progress indicator
    if (districtCount % 500 === 0) {
      console.log(`   Progress: ${districtCount} districts...`);
    }
  }
  console.log(`✅ ${districtCount} districts seeded`);
  console.log('');

  // 4. Seed Villages
  console.log('🏡 Fetching and seeding villages (desa/kelurahan)...');
  const villages = await getVillages({ transform: true });
  
  let villageCount = 0;
  for (const village of villages) {
    // Determine type from name
    const type = village.name.startsWith('DESA') 
      ? 'Desa' 
      : village.name.startsWith('KELURAHAN') 
        ? 'Kelurahan' 
        : 'Desa';
    
    await prisma.village.upsert({
      where: { id: village.code },
      update: {
        name: village.name,
        type: type,
        districtId: village.districtCode,
      },
      create: {
        id: village.code,
        name: village.name,
        type: type,
        districtId: village.districtCode,
      },
    });
    villageCount++;
    
    // Progress indicator
    if (villageCount % 5000 === 0) {
      console.log(`   Progress: ${villageCount} villages...`);
    }
  }
  console.log(`✅ ${villageCount} villages seeded`);
  console.log('');

  console.log('✨ Full regions seeding completed!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Provinces: ${provinceCount}`);
  console.log(`   - Regencies: ${regencyCount}`);
  console.log(`   - Districts: ${districtCount}`);
  console.log(`   - Villages: ${villageCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding regions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
