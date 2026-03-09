import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Try Supabase auth first
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    let userId: string | null = null;

    if (user && !authError) {
      // Supabase user
      userId = user.id;
    } else {
      // Fallback to mock auth from cookie/header
      const authHeader = request.headers.get('authorization');
      const mockUserCookie = request.cookies.get('dev_user');
      
      if (mockUserCookie) {
        try {
          const mockUser = JSON.parse(mockUserCookie.value);
          userId = mockUser.id;
        } catch (e) {
          // Invalid cookie
        }
      }
      
      // If still no userId, return unauthorized
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get wallet data
    const wallet = await db.wallet.findUnique({
      where: { userId },
      select: { id: true, balance: true, status: true },
    });

    // Get credits balance
    const userCredits = await db.userCredit.findUnique({
      where: { userId },
      select: { balance: true },
    });

    // Get transactions
    const transactions = await db.transaction.findMany({
      where: {
        wallet: { userId },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        referenceType: true,
        createdAt: true,
      },
    });

    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      reference_type: tx.referenceType,
      created_at: tx.createdAt.toISOString(),
    }));

    return NextResponse.json({
      wallet: wallet ? {
        id: wallet.id,
        balance: wallet.balance,
        status: wallet.status,
      } : null,
      credits: userCredits ? { balance: userCredits.balance } : { balance: 0 },
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
