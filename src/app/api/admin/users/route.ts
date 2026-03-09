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
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users with their roles and KYC status
    const users = await db.profile.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        avatarUrl: true,
        isKycVerified: true,
        createdAt: true,
        userRoles: {
          select: { role: true },
        },
        kyc: {
          select: { status: true },
        },
        wallet: {
          select: { status: true, balance: true },
        },
        credits: {
          select: { balance: true },
        },
        _count: {
          select: { listings: true, ordersAsBuyer: true, ordersAsSeller: true },
        },
      },
    });

    // Get total count for pagination
    const total = await db.profile.count({ where });

    // Format users data
    const formattedUsers = users.map(profile => {
      const primaryRole = profile.userRoles[0]?.role || 'user';
      const walletStatus = profile.wallet?.status || 'active';
      
      // Determine user status based on wallet status
      let userStatus = 'active';
      if (walletStatus === 'frozen') {
        userStatus = 'suspended';
      } else if (walletStatus === 'closed') {
        userStatus = 'inactive';
      }

      return {
        id: profile.userId,
        email: profile.email,
        name: profile.name || 'Unknown',
        avatar_url: profile.avatarUrl,
        role: primaryRole,
        status: userStatus,
        kyc_status: profile.kyc?.status || 'not_submitted',
        is_kyc_verified: profile.isKycVerified,
        total_listings: profile._count.listings,
        total_orders_as_buyer: profile._count.ordersAsBuyer,
        total_orders_as_seller: profile._count.ordersAsSeller,
        wallet_balance: profile.wallet?.balance || 0,
        credit_balance: profile.credits?.balance || 0,
        created_at: profile.createdAt.toISOString(),
      };
    });

    // Filter by role if specified (after formatting since role comes from relation)
    let filteredUsers = formattedUsers;
    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }
    if (status) {
      filteredUsers = filteredUsers.filter(u => u.status === status);
    }

    return NextResponse.json({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
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
    let currentUserId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      // Demo mode: extract userId from Bearer token
      currentUserId = authHeader.substring(7);
    } else {
      // Try Supabase authentication
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      currentUserId = user.id;
    }

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkAdminRole(currentUserId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the target user's profile
    const profile = await db.profile.findFirst({
      where: { userId },
      include: { userRoles: true, wallet: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    switch (action) {
      case 'update_role': {
        const { role } = data;
        if (!['user', 'admin', 'bandar'].includes(role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Update or create user role
        if (profile.userRoles.length > 0) {
          await db.userRole.update({
            where: { id: profile.userRoles[0].id },
            data: { role },
          });
        } else {
          await db.userRole.create({
            data: {
              userId: profile.userId,
              role,
              assignedBy: user.id,
            },
          });
        }

        // Log admin action
        await db.adminLog.create({
          data: {
            adminId: user.id,
            action: 'update_user_role',
            targetType: 'user',
            targetId: userId,
            details: JSON.stringify({ newRole: role }),
          },
        });

        return NextResponse.json({ success: true, message: 'Role updated successfully' });
      }

      case 'toggle_status': {
        const { status } = data;
        
        // Update wallet status to control user account status
        if (profile.wallet) {
          const walletStatus = status === 'active' ? 'active' : status === 'suspended' ? 'frozen' : 'closed';
          await db.wallet.update({
            where: { userId },
            data: { status: walletStatus },
          });
        }

        // Log admin action
        await db.adminLog.create({
          data: {
            adminId: user.id,
            action: 'toggle_user_status',
            targetType: 'user',
            targetId: userId,
            details: JSON.stringify({ newStatus: status }),
          },
        });

        return NextResponse.json({ success: true, message: 'Status updated successfully' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
