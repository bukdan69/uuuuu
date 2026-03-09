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

// GET - Fetch all support tickets (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // Build query
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    // Fetch tickets with user info
    const tickets = await db.supportTicket.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        profile: {
          select: {
            name: true,
            email: true,
          },
        },
        replies: {
          select: {
            id: true,
          },
        },
      },
    });

    // Format response
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      created_at: ticket.createdAt.toISOString(),
      last_reply_at: ticket.lastReplyAt?.toISOString() || null,
      user: {
        name: ticket.profile.name || 'Unknown',
        email: ticket.profile.email,
      },
      replyCount: ticket.replies.length,
    }));

    return NextResponse.json({
      tickets: formattedTickets,
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update ticket status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ticketId, status, assignedTo } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'resolved') {
        updateData.resolvedBy = user.id;
        updateData.resolvedAt = new Date();
      }
    }
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo;
    }

    // Update ticket
    const ticket = await db.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        status: ticket.status,
      },
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
