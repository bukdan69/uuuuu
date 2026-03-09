import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { checkUserRole } from '@/lib/auth/checkRole';

export async function GET() {
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

    const transactions = await db.creditTransaction.findMany({
      include: {
        profile: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to last 100 transactions
    });

    // Get approved topup requests for revenue calculation
    const approvedTopups = await db.creditTopupRequest.findMany({
      where: {
        status: 'approved',
      },
      select: {
        amount: true,
        creditsAmount: true,
      },
    });

    // Calculate total revenue from approved topups
    const totalRevenue = approvedTopups.reduce((sum, topup) => sum + topup.amount, 0);

    return NextResponse.json({ 
      transactions,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
