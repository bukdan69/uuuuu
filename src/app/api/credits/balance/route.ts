import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get credits balance
    const userCredits = await db.userCredit.findUnique({
      where: { userId },
      select: { 
        balance: true,
        totalBonus: true,
        totalPurchased: true,
        totalUsed: true,
      },
    });

    if (!userCredits) {
      return NextResponse.json({
        success: true,
        credits: {
          balance: 0,
          totalBonus: 0,
          totalPurchased: 0,
          totalUsed: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      credits: {
        balance: userCredits.balance,
        totalBonus: userCredits.totalBonus,
        totalPurchased: userCredits.totalPurchased,
        totalUsed: userCredits.totalUsed,
      },
    });
  } catch (error) {
    console.error('Error fetching credits balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits balance' },
      { status: 500 }
    );
  }
}
