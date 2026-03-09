import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

// Helper function to check if user is admin
async function checkAdminRole(userId: string): Promise<boolean> {
  const userRole = await db.userRole.findFirst({
    where: { userId, role: 'admin' },
  });
  return !!userRole;
}

export async function GET(request: NextRequest) {
  try {
    // Check for demo/mock authentication (development mode)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      // Demo mode: extract userId from Bearer token
      userId = authHeader.substring(7);
    } else {
      // Try Supabase authentication
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get total users
    const totalUsers = await db.profile.count();

    // Get total listings
    const totalListings = await db.listing.count();
    const activeListings = await db.listing.count({ where: { status: 'active' } });
    const pendingListings = await db.listing.count({ where: { status: 'pending_review' } });

    // Get total orders
    const totalOrders = await db.order.count();

    // Get total revenue from completed orders
    const completedOrders = await db.order.findMany({
      where: { status: 'completed' },
      select: { totalAmount: true },
    });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get pending reports
    const pendingReports = await db.listingReport.count({
      where: { status: 'pending' },
    });

    // Get pending KYC verifications
    const pendingKyc = await db.kycVerification.count({
      where: { status: 'pending' },
    });

    // Get pending withdrawals
    const pendingWithdrawals = await db.withdrawal.count({
      where: { status: 'pending' },
    });

    // Get pending listings for review
    const pendingListingsData = await db.listing.findMany({
      where: { status: 'pending_review' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        createdAt: true,
        profile: {
          select: { name: true },
        },
      },
    });

    // Get recent reports
    const recentReports = await db.listingReport.findMany({
      where: { status: 'pending' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reason: true,
        status: true,
        listing: {
          select: { title: true },
        },
      },
    });

    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await db.profile.count({
      where: { createdAt: { gte: today } },
    });

    // Get new listings today
    const newListingsToday = await db.listing.count({
      where: { createdAt: { gte: today } },
    });

    // Get new orders today
    const newOrdersToday = await db.order.count({
      where: { createdAt: { gte: today } },
    });

    const stats = {
      totalUsers,
      totalListings,
      activeListings,
      pendingListings,
      totalOrders,
      totalRevenue,
      pendingReports,
      pendingKyc,
      pendingWithdrawals,
      newUsersToday,
      newListingsToday,
      newOrdersToday,
    };

    const formattedPendingListings = pendingListingsData.map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      status: listing.status,
      created_at: listing.createdAt.toISOString(),
      seller_name: listing.profile?.name || 'Unknown',
    }));

    const formattedRecentReports = recentReports.map(report => ({
      id: report.id,
      listing: { title: report.listing?.title || 'Unknown' },
      reason: report.reason,
      status: report.status,
    }));

    return NextResponse.json({
      stats,
      pendingListings: formattedPendingListings,
      recentReports: formattedRecentReports,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
