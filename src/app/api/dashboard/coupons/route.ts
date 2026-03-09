import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Get user credits
    const userCredits = await db.userCredit.findUnique({
      where: { userId },
      select: {
        balance: true,
        totalPurchased: true,
        totalUsed: true,
        totalBonus: true,
      },
    });

    // Get user's redeemed coupons
    const redeemedCoupons = await db.couponUse.findMany({
      where: { userId },
      include: {
        coupon: {
          select: {
            code: true,
            creditsAmount: true,
          },
        },
      },
      orderBy: { usedAt: 'desc' },
      take: 10,
    });

    const formattedCoupons = redeemedCoupons.map((use) => ({
      id: use.id,
      code: use.coupon.code,
      credits_amount: use.coupon.creditsAmount,
      used_at: use.usedAt.toISOString(),
    }));

    return NextResponse.json({
      credits: userCredits || { balance: 0, totalPurchased: 0, totalUsed: 0, totalBonus: 0 },
      redeemedCoupons: formattedCoupons,
    });
  } catch (error) {
    console.error('Error fetching coupons data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    // Find the coupon
    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Kupon tidak ditemukan' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Kupon tidak aktif' }, { status: 400 });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ error: 'Kupon sudah kedaluwarsa' }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Kupon sudah mencapai batas penggunaan' }, { status: 400 });
    }

    // Check if user already used this coupon
    const existingUse = await db.couponUse.findUnique({
      where: {
        couponId_userId: {
          couponId: coupon.id,
          userId,
        },
      },
    });

    if (existingUse) {
      return NextResponse.json({ error: 'Anda sudah menggunakan kupon ini' }, { status: 400 });
    }

    // Get or create user credits
    let userCredits = await db.userCredit.findUnique({
      where: { userId },
    });

    if (!userCredits) {
      userCredits = await db.userCredit.create({
        data: {
          userId,
          balance: coupon.creditsAmount,
          totalBonus: coupon.creditsAmount,
        },
      });
    } else {
      // Update balance
      await db.userCredit.update({
        where: { userId },
        data: {
          balance: { increment: coupon.creditsAmount },
          totalBonus: { increment: coupon.creditsAmount },
        },
      });
    }

    // Record coupon use
    await db.couponUse.create({
      data: {
        couponId: coupon.id,
        userId,
      },
    });

    // Update coupon used count
    await db.coupon.update({
      where: { id: coupon.id },
      data: {
        usedCount: { increment: 1 },
      },
    });

    // Create credit transaction
    await db.creditTransaction.create({
      data: {
        userId,
        type: 'bonus',
        amount: coupon.creditsAmount,
        balanceBefore: userCredits.balance,
        balanceAfter: userCredits.balance + coupon.creditsAmount,
        description: `Redeemed coupon: ${coupon.code}`,
        referenceType: 'coupon',
        referenceId: coupon.id,
      },
    });

    return NextResponse.json({
      success: true,
      creditsAdded: coupon.creditsAmount,
      newBalance: userCredits.balance + coupon.creditsAmount,
    });
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
