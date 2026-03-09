import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Type assertion to help TypeScript understand the models
const db = prisma as any;

// Data provinsi Indonesia (34 provinsi)
const provinces = [
  { id: '11', name: 'Aceh' },
  { id: '12', name: 'Sumatera Utara' },
  { id: '13', name: 'Sumatera Barat' },
  { id: '14', name: 'Riau' },
  { id: '15', name: 'Jambi' },
  { id: '16', name: 'Sumatera Selatan' },
  { id: '17', name: 'Bengkulu' },
  { id: '18', name: 'Lampung' },
  { id: '19', name: 'Kepulauan Bangka Belitung' },
  { id: '21', name: 'Kepulauan Riau' },
  { id: '31', name: 'DKI Jakarta' },
  { id: '32', name: 'Jawa Barat' },
  { id: '33', name: 'Jawa Tengah' },
  { id: '34', name: 'DI Yogyakarta' },
  { id: '35', name: 'Jawa Timur' },
  { id: '36', name: 'Banten' },
  { id: '51', name: 'Bali' },
  { id: '52', name: 'Nusa Tenggara Barat' },
  { id: '53', name: 'Nusa Tenggara Timur' },
  { id: '61', name: 'Kalimantan Barat' },
  { id: '62', name: 'Kalimantan Tengah' },
  { id: '63', name: 'Kalimantan Selatan' },
  { id: '64', name: 'Kalimantan Timur' },
  { id: '65', name: 'Kalimantan Utara' },
  { id: '71', name: 'Sulawesi Utara' },
  { id: '72', name: 'Sulawesi Tengah' },
  { id: '73', name: 'Sulawesi Selatan' },
  { id: '74', name: 'Sulawesi Tenggara' },
  { id: '75', name: 'Gorontalo' },
  { id: '76', name: 'Sulawesi Barat' },
  { id: '81', name: 'Maluku' },
  { id: '82', name: 'Maluku Utara' },
  { id: '91', name: 'Papua' },
  { id: '92', name: 'Papua Barat' },
];

// Sample kabupaten/kota untuk beberapa provinsi populer
const regencies = [
  // DKI Jakarta
  { id: '3101', provinceId: '31', name: 'Jakarta Pusat', type: 'Kota' },
  { id: '3102', provinceId: '31', name: 'Jakarta Utara', type: 'Kota' },
  { id: '3103', provinceId: '31', name: 'Jakarta Barat', type: 'Kota' },
  { id: '3104', provinceId: '31', name: 'Jakarta Selatan', type: 'Kota' },
  { id: '3105', provinceId: '31', name: 'Jakarta Timur', type: 'Kota' },
  { id: '3106', provinceId: '31', name: 'Kepulauan Seribu', type: 'Kabupaten' },
  
  // Jawa Barat (sample)
  { id: '3201', provinceId: '32', name: 'Bogor', type: 'Kabupaten' },
  { id: '3202', provinceId: '32', name: 'Sukabumi', type: 'Kabupaten' },
  { id: '3203', provinceId: '32', name: 'Cianjur', type: 'Kabupaten' },
  { id: '3204', provinceId: '32', name: 'Bandung', type: 'Kabupaten' },
  { id: '3271', provinceId: '32', name: 'Bandung', type: 'Kota' },
  { id: '3272', provinceId: '32', name: 'Bogor', type: 'Kota' },
  { id: '3273', provinceId: '32', name: 'Sukabumi', type: 'Kota' },
  { id: '3274', provinceId: '32', name: 'Cimahi', type: 'Kota' },
  { id: '3275', provinceId: '32', name: 'Tasikmalaya', type: 'Kota' },
  { id: '3276', provinceId: '32', name: 'Banjar', type: 'Kota' },
  { id: '3277', provinceId: '32', name: 'Bekasi', type: 'Kota' },
  { id: '3278', provinceId: '32', name: 'Depok', type: 'Kota' },
  { id: '3279', provinceId: '32', name: 'Cirebon', type: 'Kota' },
  
  // Jawa Tengah (sample)
  { id: '3301', provinceId: '33', name: 'Cilacap', type: 'Kabupaten' },
  { id: '3302', provinceId: '33', name: 'Banyumas', type: 'Kabupaten' },
  { id: '3303', provinceId: '33', name: 'Purbalingga', type: 'Kabupaten' },
  { id: '3371', provinceId: '33', name: 'Magelang', type: 'Kota' },
  { id: '3372', provinceId: '33', name: 'Surakarta', type: 'Kota' },
  { id: '3373', provinceId: '33', name: 'Salatiga', type: 'Kota' },
  { id: '3374', provinceId: '33', name: 'Semarang', type: 'Kota' },
  { id: '3375', provinceId: '33', name: 'Pekalongan', type: 'Kota' },
  { id: '3376', provinceId: '33', name: 'Tegal', type: 'Kota' },
  
  // DI Yogyakarta
  { id: '3401', provinceId: '34', name: 'Kulon Progo', type: 'Kabupaten' },
  { id: '3402', provinceId: '34', name: 'Bantul', type: 'Kabupaten' },
  { id: '3403', provinceId: '34', name: 'Gunung Kidul', type: 'Kabupaten' },
  { id: '3404', provinceId: '34', name: 'Sleman', type: 'Kabupaten' },
  { id: '3471', provinceId: '34', name: 'Yogyakarta', type: 'Kota' },
  
  // Jawa Timur (sample)
  { id: '3501', provinceId: '35', name: 'Pacitan', type: 'Kabupaten' },
  { id: '3502', provinceId: '35', name: 'Ponorogo', type: 'Kabupaten' },
  { id: '3503', provinceId: '35', name: 'Trenggalek', type: 'Kabupaten' },
  { id: '3571', provinceId: '35', name: 'Kediri', type: 'Kota' },
  { id: '3572', provinceId: '35', name: 'Blitar', type: 'Kota' },
  { id: '3573', provinceId: '35', name: 'Malang', type: 'Kota' },
  { id: '3574', provinceId: '35', name: 'Probolinggo', type: 'Kota' },
  { id: '3575', provinceId: '35', name: 'Pasuruan', type: 'Kota' },
  { id: '3576', provinceId: '35', name: 'Mojokerto', type: 'Kota' },
  { id: '3577', provinceId: '35', name: 'Madiun', type: 'Kota' },
  { id: '3578', provinceId: '35', name: 'Surabaya', type: 'Kota' },
  { id: '3579', provinceId: '35', name: 'Batu', type: 'Kota' },
  
  // Bali
  { id: '5101', provinceId: '51', name: 'Jembrana', type: 'Kabupaten' },
  { id: '5102', provinceId: '51', name: 'Tabanan', type: 'Kabupaten' },
  { id: '5103', provinceId: '51', name: 'Badung', type: 'Kabupaten' },
  { id: '5104', provinceId: '51', name: 'Gianyar', type: 'Kabupaten' },
  { id: '5105', provinceId: '51', name: 'Klungkung', type: 'Kabupaten' },
  { id: '5106', provinceId: '51', name: 'Bangli', type: 'Kabupaten' },
  { id: '5107', provinceId: '51', name: 'Karangasem', type: 'Kabupaten' },
  { id: '5108', provinceId: '51', name: 'Buleleng', type: 'Kabupaten' },
  { id: '5171', provinceId: '51', name: 'Denpasar', type: 'Kota' },
];

async function main() {
  console.log('🌱 Seeding regions data...');

  // Seed provinces
  console.log('📍 Seeding provinces...');
  for (const province of provinces) {
    await db.province.upsert({
      where: { id: province.id },
      update: province,
      create: province,
    });
  }
  console.log(`✅ ${provinces.length} provinces seeded`);

  // Seed regencies
  console.log('🏙️  Seeding regencies...');
  for (const regency of regencies) {
    await db.regency.upsert({
      where: { id: regency.id },
      update: regency,
      create: regency,
    });
  }
  console.log(`✅ ${regencies.length} regencies seeded`);

  console.log('✨ Regions seeding completed!');
  console.log('');
  console.log('📝 Note: Ini adalah data sample. Untuk data lengkap, Anda bisa:');
  console.log('   1. Import dari API Wilayah Indonesia: https://github.com/cahyadsn/wilayah');
  console.log('   2. Atau gunakan package: https://www.npmjs.com/package/wilayah-indonesia');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding regions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
