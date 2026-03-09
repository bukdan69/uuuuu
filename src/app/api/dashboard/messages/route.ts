import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Get conversations where user is buyer or seller
    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: {
              where: { isPrimary: true },
              select: { imageUrl: true },
              take: 1,
            },
          },
        },
        buyer: {
          select: {
            userId: true,
            name: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            userId: true,
            name: true,
            avatarUrl: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get unread counts for each conversation
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await db.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        });

        const otherUser = conv.buyerId === userId ? conv.seller : conv.buyer;
        const lastMessage = conv.messages[0];

        return {
          id: conv.id,
          listing: conv.listing ? {
            id: conv.listing.id,
            title: conv.listing.title,
            image: conv.listing.images[0]?.imageUrl || null,
          } : null,
          otherUser: {
            id: otherUser?.userId,
            name: otherUser?.name || 'Pengguna',
            avatar: otherUser?.avatarUrl,
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt.toISOString(),
            isMine: lastMessage.senderId === userId,
          } : null,
          unreadCount,
          updatedAt: conv.updatedAt.toISOString(),
        };
      })
    );

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
