import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding notifications...');

  // Get first user from profiles
  const user = await prisma.profile.findFirst({
    select: { userId: true, email: true, name: true },
  });

  if (!user) {
    console.log('❌ No users found. Please create a user first.');
    return;
  }

  console.log(`📧 Creating notifications for user: ${user.name || user.email}`);

  // Create sample notifications
  const notifications = [
    {
      userId: user.userId,
      type: 'info',
      title: 'Selamat Datang di Platform!',
      message: 'Terima kasih telah bergabung dengan marketplace kami. Mulai jual atau beli produk sekarang!',
      isRead: false,
    },
    {
      userId: user.userId,
      type: 'success',
      title: 'Verifikasi Email Berhasil',
      message: 'Email Anda telah berhasil diverifikasi. Sekarang Anda dapat mengakses semua fitur platform.',
      isRead: false,
    },
    {
      userId: user.userId,
      type: 'order',
      title: 'Pesanan Baru Diterima',
      message: 'Anda memiliki pesanan baru dari pembeli. Segera proses pesanan untuk meningkatkan rating toko Anda.',
      isRead: false,
    },
    {
      userId: user.userId,
      type: 'payment',
      title: 'Pembayaran Berhasil',
      message: 'Pembayaran untuk paket kredit 100 telah berhasil diproses. Kredit Anda telah ditambahkan.',
      isRead: true,
      readAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      userId: user.userId,
      type: 'warning',
      title: 'Iklan Akan Segera Berakhir',
      message: 'Iklan "Laptop Gaming ROG" Anda akan berakhir dalam 3 hari. Perpanjang sekarang untuk tetap tampil di pencarian.',
      isRead: true,
      readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      userId: user.userId,
      type: 'message',
      title: 'Pesan Baru dari Pembeli',
      message: 'Anda memiliki pesan baru dari calon pembeli. Balas segera untuk meningkatkan peluang penjualan.',
      isRead: false,
    },
    {
      userId: user.userId,
      type: 'info',
      title: 'Promo Spesial Hari Ini!',
      message: 'Dapatkan diskon 20% untuk semua paket kredit. Promo terbatas hanya hari ini!',
      isRead: false,
    },
  ];

  // Create notifications
  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log(`✅ Created ${notifications.length} sample notifications`);
  console.log(`📊 Unread: ${notifications.filter(n => !n.isRead).length}`);
  console.log(`📊 Read: ${notifications.filter(n => n.isRead).length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding notifications:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
