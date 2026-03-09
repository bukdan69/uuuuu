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

    const withdrawal = await db.withdrawal.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    const updated = await db.withdrawal.update({
      where: { id },
      data: {
        status: newStatus,
        processedBy: user.id,
        processedAt: new Date(),
        ...(notes && { notes }),
      },
    });

    // Log activity
    await logActivity({
      userId: user.id,
      userEmail: withdrawal.profile.email,
      action: action === 'approve' ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
      description: `Withdrawal ${action === 'approve' ? 'approved' : 'rejected'} for ${withdrawal.profile.email} - Amount: ${withdrawal.amount}`,
      metadata: {
        withdrawalId: id,
        amount: withdrawal.amount,
        bankName: withdrawal.bankName,
      },
    });

    return NextResponse.json({ withdrawal: updated });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
