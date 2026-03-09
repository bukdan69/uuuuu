import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity } from '@/lib/activityLog';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { action, notes } = body;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const topupRequest = await db.creditTopupRequest.findUnique({
      where: { id },
    });

    if (!topupRequest) {
      return NextResponse.json({ error: 'Topup request not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    const updated = await db.creditTopupRequest.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedBy: user.id,
        reviewedAt: new Date(),
        ...(notes && { notes }),
      },
    });

    // If approved, add credits to user
    if (action === 'approve') {
      // Get or create user credit record
      const userCredit = await db.userCredit.upsert({
        where: { userId: topupRequest.userId },
        create: {
          userId: topupRequest.userId,
          balance: topupRequest.creditsAmount + topupRequest.bonusCredits,
          totalPurchased: topupRequest.creditsAmount,
          totalBonus: topupRequest.bonusCredits,
        },
        update: {
          balance: {
            increment: topupRequest.creditsAmount + topupRequest.bonusCredits,
          },
          totalPurchased: {
            increment: topupRequest.creditsAmount,
          },
          totalBonus: {
            increment: topupRequest.bonusCredits,
          },
        },
      });

      // Create credit transaction
      await db.creditTransaction.create({
        data: {
          userId: topupRequest.userId,
          type: 'purchase',
          amount: topupRequest.creditsAmount + topupRequest.bonusCredits,
          balanceBefore: userCredit.balance - (topupRequest.creditsAmount + topupRequest.bonusCredits),
          balanceAfter: userCredit.balance,
          description: `Topup kredit - ${topupRequest.creditsAmount} kredit + ${topupRequest.bonusCredits} bonus`,
          referenceType: 'topup_request',
          referenceId: id,
        },
      });
    }

    // Log activity
    const profile = await db.profile.findUnique({
      where: { userId: topupRequest.userId },
      select: { email: true },
    });

    await logActivity({
      userId: user.id,
      userEmail: profile?.email || 'unknown',
      action: action === 'approve' ? 'TOPUP_APPROVED' : 'TOPUP_REJECTED',
      description: `Topup request ${action === 'approve' ? 'approved' : 'rejected'} - Amount: ${topupRequest.amount}`,
      metadata: {
        topupRequestId: id,
        amount: topupRequest.amount,
        creditsAmount: topupRequest.creditsAmount,
      },
    });

    return NextResponse.json({ topupRequest: updated });
  } catch (error) {
    console.error('Error updating topup request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
