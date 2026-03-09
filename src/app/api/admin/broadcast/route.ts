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

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      userId = authHeader.substring(7);
    } else {
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
    const { title, message, target } = body;

    if (!title || !message || !target) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get target users based on filter
    let targetUsers: { userId: string }[] = [];

    switch (target) {
      case 'all':
        targetUsers = await db.profile.findMany({
          select: { userId: true },
        });
        break;

      case 'sellers':
        // Users with at least 1 listing
        targetUsers = await db.profile.findMany({
          where: {
            listings: {
              some: {},
            },
          },
          select: { userId: true },
        });
        break;

      case 'verified':
        // Users with KYC verified
        targetUsers = await db.profile.findMany({
          where: {
            isKycVerified: true,
          },
          select: { userId: true },
        });
        break;

      case 'buyers':
        // Users with at least 1 order as buyer
        targetUsers = await db.profile.findMany({
          where: {
            ordersAsBuyer: {
              some: {},
            },
          },
          select: { userId: true },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
    }

    // Create notifications for all target users
    const notifications = targetUsers.map((user) => ({
      userId: user.userId,
      type: 'info',
      title,
      message,
      isRead: false,
    }));

    // Batch create notifications
    await db.notification.createMany({
      data: notifications,
    });

    // Get user email for activity log
    const userProfile = await db.profile.findUnique({
      where: { userId },
      select: { email: true },
    });

    // Log the broadcast in activity log
    await db.activityLog.create({
      data: {
        userId,
        userEmail: userProfile?.email || '',
        action: 'broadcast_sent',
        description: `Broadcast sent: ${title}`,
        metadata: {
          target,
          recipientCount: notifications.length,
          title,
          message: message.substring(0, 100),
        },
      },
    });

    return NextResponse.json({
      success: true,
      recipientCount: notifications.length,
      message: `Broadcast sent to ${notifications.length} users`,
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get broadcast history
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      userId = authHeader.substring(7);
    } else {
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

    // Get broadcast history from activity logs
    const broadcasts = await db.activityLog.findMany({
      where: {
        action: 'broadcast_sent',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    const formattedBroadcasts = broadcasts.map((log) => {
      let metadata: any = {};
      try {
        // metadata is already a JSON object from Prisma
        metadata = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : (log.metadata || {});
      } catch (e) {
        // ignore
      }

      return {
        id: log.id,
        title: metadata.title || 'Broadcast',
        message: metadata.message || '',
        target: metadata.target || 'all',
        recipientCount: metadata.recipientCount || 0,
        createdAt: log.createdAt,
      };
    });

    return NextResponse.json({ broadcasts: formattedBroadcasts });
  } catch (error) {
    console.error('Error fetching broadcast history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
