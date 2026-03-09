import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const REGISTRATION_BONUS = 500;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, name } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user already received registration bonus
    const existingBonus = await db.creditTransaction.findFirst({
      where: {
        userId,
        type: 'bonus',
        description: 'Bonus registrasi user baru',
      },
    });

    if (existingBonus) {
      return NextResponse.json({
        success: false,
        message: 'User already received registration bonus',
        credits: null,
      });
    }

    // Ensure profile exists first
    let profile = await db.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Create profile if doesn't exist
      profile = await db.profile.create({
        data: {
          userId,
          email: email || `${userId}@example.com`,
          name: name || 'User',
        },
      });
    }

    // Get or create user credits
    let userCredits = await db.userCredit.findUnique({
      where: { userId },
    });

    if (!userCredits) {
      // Create new user credits with bonus
      userCredits = await db.userCredit.create({
        data: {
          userId,
          balance: REGISTRATION_BONUS,
          totalBonus: REGISTRATION_BONUS,
        },
      });

      // Create transaction record
      await db.creditTransaction.create({
        data: {
          userId,
          type: 'bonus',
          amount: REGISTRATION_BONUS,
          balanceBefore: 0,
          balanceAfter: REGISTRATION_BONUS,
          description: 'Bonus registrasi user baru',
          referenceType: 'registration',
          referenceId: userId,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Selamat! Anda mendapatkan bonus ${REGISTRATION_BONUS} kredit`,
        credits: {
          balance: REGISTRATION_BONUS,
          bonus: REGISTRATION_BONUS,
        },
      });
    } else {
      // User credits already exist, add bonus
      const newBalance = userCredits.balance + REGISTRATION_BONUS;
      const newTotalBonus = userCredits.totalBonus + REGISTRATION_BONUS;

      await db.userCredit.update({
        where: { userId },
        data: {
          balance: newBalance,
          totalBonus: newTotalBonus,
        },
      });

      // Create transaction record
      await db.creditTransaction.create({
        data: {
          userId,
          type: 'bonus',
          amount: REGISTRATION_BONUS,
          balanceBefore: userCredits.balance,
          balanceAfter: newBalance,
          description: 'Bonus registrasi user baru',
          referenceType: 'registration',
          referenceId: userId,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Selamat! Anda mendapatkan bonus ${REGISTRATION_BONUS} kredit`,
        credits: {
          balance: newBalance,
          bonus: REGISTRATION_BONUS,
        },
      });
    }
  } catch (error) {
    console.error('Error giving registration bonus:', error);
    return NextResponse.json(
      { error: 'Failed to give registration bonus' },
      { status: 500 }
    );
  }
}
