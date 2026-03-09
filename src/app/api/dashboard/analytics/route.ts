import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const days = 7;
    const dailyStats = [];

    // Get user's listings
    const userListings = await db.listing.findMany({
      where: { userId },
      select: { id: true },
    });

    const listingIds = userListings.map(l => l.id);

    // Calculate stats for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      // Get views for this day (from listing view_count changes)
      // Since we don't track view history, we'll use current view count divided by days
      const listings = await db.listing.findMany({
        where: {
          userId,
          createdAt: { lte: dayEnd },
        },
        select: { viewCount: true },
      });

      // Approximate daily views (this is a simplification)
      const totalViews = listings.reduce((sum, l) => sum + l.viewCount, 0);
      const avgDailyViews = listingIds.length > 0 ? Math.floor(totalViews / Math.max(days, 1)) : 0;

      // Get orders for this day
      const dayOrders = await db.order.findMany({
        where: {
          sellerId: userId,
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
          status: { in: ['paid', 'shipped', 'completed'] },
        },
        select: { totalAmount: true },
      });

      const ordersCount = dayOrders.length;
      const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      dailyStats.push({
        date: format(date, 'dd MMM'),
        views: avgDailyViews,
        orders: ordersCount,
        revenue: revenue,
      });
    }

    // Calculate totals
    const totals = {
      views: dailyStats.reduce((sum, s) => sum + s.views, 0),
      orders: dailyStats.reduce((sum, s) => sum + s.orders, 0),
      revenue: dailyStats.reduce((sum, s) => sum + s.revenue, 0),
    };

    return NextResponse.json({
      dailyStats,
      totals,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
