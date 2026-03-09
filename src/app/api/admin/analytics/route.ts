import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { checkUserRole } from '@/lib/auth/checkRole';

// GET /api/admin/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get stats
    const [
      totalUsers,
      totalListings,
      activeListings,
      totalOrders,
      completedOrders,
      totalRevenue,
      totalViews,
    ] = await Promise.all([
      // Total users
      db.profile.count(),
      
      // Total listings
      db.listing.count(),
      
      // Active listings
      db.listing.count({
        where: { status: 'active' }
      }),
      
      // Total orders
      db.order.count(),
      
      // Completed orders
      db.order.count({
        where: { status: 'completed' }
      }),
      
      // Total revenue (sum of completed orders)
      db.order.aggregate({
        where: { status: 'completed' },
        _sum: { totalAmount: true }
      }),
      
      // Total views (sum of all listing views)
      db.listing.aggregate({
        _sum: { viewCount: true }
      }),
    ]);

    // Calculate conversion rate
    const conversionRate = totalViews._sum.viewCount 
      ? ((completedOrders / totalViews._sum.viewCount) * 100).toFixed(2)
      : '0.00';

    // Get daily views for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all listings created in last 7 days
    const recentListings = await db.listing.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true
      }
    });

    // Get all orders created in last 7 days
    const recentOrders = await db.order.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true
      }
    });

    // Group by date
    const dailyViews = recentListings.reduce((acc, listing) => {
      const date = listing.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dailyOrders = recentOrders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Format daily data
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        label: days[date.getDay()],
      };
    });

    const dailyViewsData = last7Days.map(day => {
      return {
        label: day.label,
        value: dailyViews[day.date] || 0,
      };
    });

    const dailyOrdersData = last7Days.map(day => {
      return {
        label: day.label,
        value: dailyOrders[day.date] || 0,
      };
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalListings,
        activeListings,
        totalOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum?.totalAmount || 0,
        totalViews: totalViews._sum.viewCount || 0,
        conversionRate: parseFloat(conversionRate),
      },
      charts: {
        dailyViews: dailyViewsData,
        dailyOrders: dailyOrdersData,
      },
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
