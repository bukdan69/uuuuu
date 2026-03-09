import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⚙️  Seeding platform settings...');

  const settings = [
    {
      key: 'site_name',
      value: 'UMKM ID',
      description: 'Nama situs platform',
    },
    {
      key: 'site_email',
      value: 'admin@umkm.id',
      description: 'Email admin platform',
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      description: 'Mode maintenance untuk menonaktifkan akses publik',
    },
    {
      key: 'registration_enabled',
      value: 'true',
      description: 'Izinkan pengguna baru mendaftar',
    },
    {
      key: 'email_notifications',
      value: 'true',
      description: 'Kirim notifikasi via email',
    },
    {
      key: 'kyc_required',
      value: 'false',
      description: 'Wajib KYC untuk withdraw',
    },
    {
      key: 'min_withdrawal',
      value: '50000',
      description: 'Minimum penarikan dalam Rupiah',
    },
    {
      key: 'platform_fee',
      value: '5',
      description: 'Biaya platform dalam persen',
    },
    {
      key: 'initial_user_credits',
      value: '500',
      description: 'Jumlah kredit yang diberikan otomatis saat user baru mendaftar',
    },
  ];

  for (const setting of settings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
      },
      create: setting,
    });

    console.log(`✅ Upserted setting: ${setting.key} = ${setting.value}`);
  }

  console.log('✅ Platform settings seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding platform settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
