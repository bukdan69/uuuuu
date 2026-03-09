import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎫 Seeding support tickets...');

  // Get a user to create tickets for (use the first user in the database)
  const user = await prisma.profile.findFirst({
    select: { userId: true },
  });

  if (!user) {
    console.log('❌ No users found. Please create a user first.');
    return;
  }

  console.log(`✅ Found user: ${user.userId}`);

  // Create sample tickets
  const tickets = [
    {
      userId: user.userId,
      subject: 'Pembayaran tidak berhasil',
      category: 'payment',
      priority: 'high',
      status: 'open',
      message: 'Saya sudah melakukan transfer untuk top up kredit, tapi saldo belum masuk. Mohon bantuannya.',
    },
    {
      userId: user.userId,
      subject: 'Cara boost iklan',
      category: 'listing',
      priority: 'normal',
      status: 'in_progress',
      message: 'Bagaimana cara boost iklan saya agar muncul di halaman utama?',
    },
    {
      userId: user.userId,
      subject: 'Verifikasi KYC tertunda',
      category: 'account',
      priority: 'high',
      status: 'waiting_customer',
      message: 'Sudah submit dokumen KYC 3 hari yang lalu tapi belum ada update. Mohon dicek.',
    },
    {
      userId: user.userId,
      subject: 'Request fitur baru',
      category: 'other',
      priority: 'low',
      status: 'resolved',
      message: 'Apakah bisa ditambahkan fitur chat langsung dengan pembeli?',
    },
    {
      userId: user.userId,
      subject: 'Pesanan tidak sampai',
      category: 'order',
      priority: 'urgent',
      status: 'open',
      message: 'Pembeli komplain pesanan belum sampai padahal sudah 2 minggu. Bagaimana solusinya?',
    },
  ];

  for (const ticketData of tickets) {
    const { message, ...ticketInfo } = ticketData;

    // Create ticket
    const ticket = await prisma.supportTicket.create({
      data: ticketInfo,
    });

    // Create initial reply
    await prisma.ticketReply.create({
      data: {
        ticketId: ticket.id,
        userId: user.userId,
        message,
        isStaff: false,
      },
    });

    // Update lastReplyAt
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        lastReplyAt: new Date(),
      },
    });

    console.log(`✅ Created ticket: ${ticket.subject}`);
  }

  console.log('✅ Support tickets seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding support tickets:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
