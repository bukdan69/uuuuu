import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkUserRole } from '@/lib/auth/checkRole';
import { db } from '@/lib/db';

// PATCH /api/admin/banners/[id]/status - Update banner status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['pending', 'active', 'paused', 'expired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get existing banner
    const existingBanner = await db.banner.findUnique({
      where: { id: params.id },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    const banner = await db.banner.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'active' && { approvedBy: user.id, approvedAt: new Date() }),
      },
    });

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId: user.id,
        action: 'update_banner_status',
        targetType: 'banner',
        targetId: banner.id,
        details: JSON.stringify({ 
          previousStatus: existingBanner.status,
          newStatus: status 
        }),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      },
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Error updating banner status:', error);
    return NextResponse.json(
      { error: 'Failed to update banner status' },
      { status: 500 }
    );
  }
}
