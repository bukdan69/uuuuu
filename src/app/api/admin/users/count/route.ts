import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Count total profiles
    const totalProfiles = await db.profile.count();

    // Count by role
    const roles = await db.userRole.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    // Count user credits
    const totalCredits = await db.userCredit.count();

    // Get total credits balance
    const creditsSum = await db.userCredit.aggregate({
      _sum: {
        balance: true,
        totalBonus: true,
      },
    });

    // Count bonus transactions
    const bonusTransactions = await db.creditTransaction.count({
      where: {
        type: 'bonus',
        description: 'Bonus registrasi user baru',
      },
    });

    // Get sample users
    const sampleUsers = await db.profile.findMany({
      take: 10,
      select: {
        userId: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalProfiles,
        roleDistribution: roles.map(r => ({
          role: r.role,
          count: r._count.role,
        })),
        credits: {
          usersWithCredits: totalCredits,
          totalBalance: creditsSum._sum.balance || 0,
          totalBonus: creditsSum._sum.totalBonus || 0,
        },
        bonusStats: {
          usersReceivedBonus: bonusTransactions,
        },
        sampleUsers: sampleUsers.map(u => ({
          userId: u.userId,
          email: u.email,
          name: u.name,
          createdAt: u.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Error counting users:', error);
    return NextResponse.json(
      { error: 'Failed to count users' },
      { status: 500 }
    );
  }
}
