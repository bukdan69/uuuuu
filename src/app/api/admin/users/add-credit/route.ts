import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity } from '@/lib/activityLog';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, amount, note } = body;

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Get target user profile
    const targetProfile = await db.profile.findUnique({
      where: { userId },
      select: { email: true, name: true },
    });

    if (!targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create user credit record
    let userCredit = await db.userCredit.findUnique({
      where: { userId },
    });

    if (!userCredit) {
      userCredit = await db.userCredit.create({
        data: {
          userId,
          balance: 0,
          totalPurchased: 0,
          totalUsed: 0,
          totalBonus: 0,
        },
      });
    }

    const balanceBefore = userCredit.balance;
    const balanceAfter = balanceBefore + amount;

    // Update user credit balance
    await db.userCredit.update({
      where: { userId },
      data: {
        balance: balanceAfter,
        totalBonus: userCredit.totalBonus + amount,
      },
    });

    // Create credit transaction record
    await db.creditTransaction.create({
      data: {
        userId,
        type: 'bonus',
        amount,
        balanceBefore,
        balanceAfter,
        description: note || 'Admin credit adjustment',
        referenceType: 'admin_adjustment',
        referenceId: user.id,
      },
    });

    // Log activity
    await logActivity({
      userId: user.id,
      userEmail: user.email || '',
      action: 'add_user_credit',
      description: `Menambahkan ${amount} kredit ke ${targetProfile.name || targetProfile.email}`,
      metadata: {
        targetUserId: userId,
        targetUserEmail: targetProfile.email,
        amount,
        note,
        balanceBefore,
        balanceAfter,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Credit added successfully',
      data: {
        amount,
        balanceBefore,
        balanceAfter,
      },
    });
  } catch (error) {
    console.error('Error adding credit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
