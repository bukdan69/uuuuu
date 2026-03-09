import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

// GET - Fetch user's support tickets
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's tickets with reply count
    const tickets = await db.supportTicket.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
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

// POST - Create new support ticket
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, message, priority, category } = body;

    // Validate required fields
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Create ticket
    const ticket = await db.supportTicket.create({
      data: {
        userId: user.id,
        subject,
        category: category || null,
        priority: priority || 'normal',
        status: 'open',
      },
    });

    // Create first reply (the initial message)
    await db.ticketReply.create({
      data: {
        ticketId: ticket.id,
        userId: user.id,
        message,
        isStaff: false,
      },
    });

    // Update lastReplyAt
    await db.supportTicket.update({
      where: { id: ticket.id },
      data: {
        lastReplyAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
      },
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
