import { db } from '../src/lib/db';

async function seedTopupRequests() {
  console.log('Seeding credit topup requests...');

  // Get some users
  const users = await db.profile.findMany({
    take: 5,
    select: { userId: true, name: true },
  });

  if (users.length === 0) {
    console.log('No users found. Please seed users first.');
    return;
  }

  // Get credit packages
  const packages = await db.creditPackage.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  if (packages.length === 0) {
    console.log('No credit packages found. Please seed packages first.');
    return;
  }

  const topupRequests = [
    {
      userId: users[0].userId,
      amount: packages[0].price, // Paket Starter
      creditsAmount: packages[0].credits,
      bonusCredits: packages[0].bonusCredits,
      status: 'approved',
      reviewedBy: users[0].userId,
      reviewedAt: new Date(),
      notes: 'Pembayaran terverifikasi',
    },
    {
      userId: users[1]?.userId || users[0].userId,
      amount: packages[1].price, // Paket Popular
      creditsAmount: packages[1].credits,
      bonusCredits: packages[1].bonusCredits,
      status: 'approved',
      reviewedBy: users[0].userId,
      reviewedAt: new Date(),
      notes: 'Pembayaran terverifikasi',
    },
    {
      userId: users[2]?.userId || users[0].userId,
      amount: packages[2].price, // Paket Business
      creditsAmount: packages[2].credits,
      bonusCredits: packages[2].bonusCredits,
      status: 'approved',
      reviewedBy: users[0].userId,
      reviewedAt: new Date(),
      notes: 'Pembayaran terverifikasi',
    },
    {
      userId: users[3]?.userId || users[0].userId,
      amount: packages[1].price, // Paket Popular lagi
      creditsAmount: packages[1].credits,
      bonusCredits: packages[1].bonusCredits,
      status: 'approved',
      reviewedBy: users[0].userId,
      reviewedAt: new Date(),
      notes: 'Pembayaran terverifikasi',
    },
    {
      userId: users[4]?.userId || users[0].userId,
      amount: packages[0].price, // Paket Starter lagi
      creditsAmount: packages[0].credits,
      bonusCredits: packages[0].bonusCredits,
      status: 'pending',
      notes: 'Menunggu verifikasi',
    },
  ];

  for (const request of topupRequests) {
    await db.creditTopupRequest.create({
      data: request,
    });
    console.log(`  ✓ Created topup request: ${request.creditsAmount} credits for Rp ${request.amount.toLocaleString('id-ID')} (${request.status})`);
  }

  // Calculate total revenue
  const approvedRequests = topupRequests.filter(r => r.status === 'approved');
  const totalRevenue = approvedRequests.reduce((sum, r) => sum + r.amount, 0);

  console.log(`\n✅ Topup requests seeded successfully!`);
  console.log(`Total approved requests: ${approvedRequests.length}`);
  console.log(`Total revenue: Rp ${totalRevenue.toLocaleString('id-ID')}`);
}

seedTopupRequests()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
