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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Get listings with seller info
    const listings = await db.listing.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        status: true,
        condition: true,
        listingType: true,
        viewCount: true,
        favoriteCount: true,
        createdAt: true,
        approvedAt: true,
        rejectedReason: true,
        profile: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: { name: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { imageUrl: true },
        },
        _count: {
          select: { reports: true },
        },
      },
    });

    // Get total count for pagination
    const total = await db.listing.count({ where });

    // Get counts by status
    const statusCounts = await db.listing.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const countsByStatus: Record<string, number> = {};
    statusCounts.forEach(item => {
      countsByStatus[item.status] = item._count.id;
    });

    // Format listings data
    const formattedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      price: listing.price,
      status: listing.status,
      condition: listing.condition,
      listing_type: listing.listingType,
      view_count: listing.viewCount,
      favorite_count: listing.favoriteCount,
      created_at: listing.createdAt.toISOString(),
      approved_at: listing.approvedAt?.toISOString() || null,
      rejected_reason: listing.rejectedReason || null,
      primary_image: listing.images[0]?.imageUrl || null,
      category: listing.category?.name || null,
      seller: {
        id: listing.profile?.userId,
        name: listing.profile?.name || 'Unknown',
        email: listing.profile?.email || '',
      },
      report_count: listing._count.reports,
    }));

    return NextResponse.json({
      listings: formattedListings,
      counts_by_status: countsByStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { listingId, action, data } = body;

    if (!listingId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the target listing
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true, title: true, status: true, userId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    switch (action) {
      case 'approve': {
        await db.listing.update({
          where: { id: listingId },
          data: {
            status: 'active',
            approvedBy: userId,
            approvedAt: new Date(),
            publishedAt: new Date(),
            rejectedReason: null,
          },
        });

        // Log admin action
        await db.adminLog.create({
          data: {
            adminId: userId,
            action: 'approve_listing',
            targetType: 'listing',
            targetId: listingId,
            details: JSON.stringify({ title: listing.title }),
          },
        });

        return NextResponse.json({ success: true, message: 'Listing approved successfully' });
      }

      case 'reject': {
        const { reason } = data;
        if (!reason) {
          return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
        }

        await db.listing.update({
          where: { id: listingId },
          data: {
            status: 'rejected',
            rejectedReason: reason,
          },
        });

        // Log admin action
        await db.adminLog.create({
          data: {
            adminId: userId,
            action: 'reject_listing',
            targetType: 'listing',
            targetId: listingId,
            details: JSON.stringify({ title: listing.title, reason }),
          },
        });

        return NextResponse.json({ success: true, message: 'Listing rejected' });
      }

      case 'toggle_status': {
        const { status } = data;
        
        if (!['draft', 'pending_review', 'active', 'sold', 'expired', 'rejected'].includes(status)) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await db.listing.update({
          where: { id: listingId },
          data: { status },
        });

        // Log admin action
        await db.adminLog.create({
          data: {
            adminId: userId,
            action: 'update_listing_status',
            targetType: 'listing',
            targetId: listingId,
            details: JSON.stringify({ title: listing.title, newStatus: status }),
          },
        });

        return NextResponse.json({ success: true, message: 'Status updated successfully' });
      }

      case 'bulk_approve': {
        const { listingIds } = data;
        if (!Array.isArray(listingIds) || listingIds.length === 0) {
          return NextResponse.json({ error: 'No listings selected' }, { status: 400 });
        }

        await db.listing.updateMany({
          where: { id: { in: listingIds } },
          data: {
            status: 'active',
            approvedBy: userId,
            approvedAt: new Date(),
            publishedAt: new Date(),
          },
        });

        // Log admin action
        await db.adminLog.create({
          data: {
            adminId: userId,
            action: 'bulk_approve_listings',
            targetType: 'listing',
            details: JSON.stringify({ count: listingIds.length, listingIds }),
          },
        });

        return NextResponse.json({ success: true, message: `${listingIds.length} listings approved` });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
