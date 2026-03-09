import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkUserRole } from '@/lib/auth/checkRole';
import { db } from '@/lib/db';

// PATCH /api/admin/banners/[id] - Update banner
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { title, imageUrl, targetUrl, position, budgetTotal, startsAt, endsAt, status } = body;

    // Get existing banner
    const existingBanner = await db.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    // Validation
    if (budgetTotal !== undefined && budgetTotal <= 0) {
      return NextResponse.json(
        { error: 'Budget must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate position if provided
    if (position) {
      const validPositions = [
        'marketplace-top', 
        'marketplace-sidebar',
        'marketplace-inline', 
        'marketplace-inline-sidebar',
        'home-center',
        'home-center-sidebar',
        'home-inline',
        'home-inline-sidebar'
      ];
      if (!validPositions.includes(position)) {
        return NextResponse.json(
          { error: 'Invalid position' },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'active', 'paused', 'expired'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
    }

    const banner = await db.banner.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(imageUrl && { imageUrl }),
        ...(targetUrl && { targetUrl }),
        ...(position && { position }),
        ...(status && { status }),
        ...(budgetTotal !== undefined && { budgetTotal }),
        ...(startsAt && { startsAt: new Date(startsAt) }),
        ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
      },
    });

    // Log admin action (optional - don't fail if logging fails)
    try {
      await db.adminLog.create({
        data: {
          adminId: user.id,
          action: 'update_banner',
          targetType: 'banner',
          targetId: banner.id,
          details: JSON.stringify({ 
            changes: { title, position, status, budgetTotal },
            previous: { 
              title: existingBanner.title, 
              position: existingBanner.position,
              status: existingBanner.status,
              budgetTotal: existingBanner.budgetTotal 
            }
          }),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        },
      });
    } catch (logError) {
      console.error('Failed to log admin action:', logError);
      // Continue anyway - logging failure shouldn't prevent update
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/banners/[id] - Delete banner (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Delete request from user:', user.id, user.email);

    // Check if user is admin
    const isAdmin = await checkUserRole(user.id, 'admin');
    console.log('Is admin?', isAdmin);
    
    if (!isAdmin) {
      console.error('User is not admin');
      return NextResponse.json({ error: 'Forbidden - User is not admin' }, { status: 403 });
    }

    // Get existing banner
    const existingBanner = await db.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      console.error('Banner not found:', id);
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    console.log('Deleting banner:', existingBanner.title);

    // Soft delete
    await db.banner.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'expired', // Also set status to expired
      },
    });

    console.log('Banner deleted successfully');

    // Log admin action (optional - don't fail if logging fails)
    try {
      await db.adminLog.create({
        data: {
          adminId: user.id,
          action: 'delete_banner',
          targetType: 'banner',
          targetId: id,
          details: JSON.stringify({ 
            title: existingBanner.title,
            position: existingBanner.position 
          }),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        },
      });
    } catch (logError) {
      console.error('Failed to log admin action:', logError);
      // Continue anyway - logging failure shouldn't prevent deletion
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to delete banner', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
