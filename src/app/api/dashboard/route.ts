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

    // Get wallet balance
    const wallet = await db.wallet.findUnique({
      where: { userId },
      select: { balance: true },
    });

    // Get credits balance
    const userCredits = await db.userCredit.findUnique({
      where: { userId },
      select: { balance: true },
    });

    // Get listings stats
    const totalListings = await db.listing.count({
      where: { userId },
    });

    const activeListings = await db.listing.count({
      where: { userId, status: 'active' },
    });

    // Get orders stats (as seller)
    const totalOrders = await db.order.count({
      where: { sellerId: userId },
    });

    const pendingOrders = await db.order.count({
      where: { sellerId: userId, status: 'pending' },
    });

    // Get unread messages count
    // Get conversations where user is buyer or seller
    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      select: { id: true },
    });

    const conversationIds = conversations.map(c => c.id);

    const unreadMessages = await db.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId },
        isRead: false,
      },
    });

    // Get recent transactions
    const transactions = await db.transaction.findMany({
      where: {
        wallet: { userId },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        createdAt: true,
      },
    });

    // Get recent orders (as seller)
    const orders = await db.order.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        listingId: true,
      },
    });

    // Get listing info for orders
    const listingIds = orders.filter(o => o.listingId).map(o => o.listingId as string);
    const listings = listingIds.length > 0 ? await db.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true, title: true },
    }) : [];

    const listingMap = new Map(listings.map(l => [l.id, l.title]));

    const ordersWithListing = orders.map(order => ({
      id: order.id,
      listing: order.listingId ? { title: listingMap.get(order.listingId) || 'Produk' } : null,
      amount: order.totalAmount,
      status: order.status,
      created_at: order.createdAt.toISOString(),
    }));

    // Get recent listings with images
    const userListings = await db.listing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        viewCount: true,
        images: {
          select: { imageUrl: true, isPrimary: true },
        },
      },
    });

    const formattedListings = userListings.map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      status: listing.status,
      view_count: listing.viewCount,
      listing_images: listing.images.map(img => ({
        image_url: img.imageUrl,
        is_primary: img.isPrimary,
      })),
    }));

    const stats = {
      walletBalance: wallet?.balance || 0,
      creditsBalance: userCredits?.balance || 0,
      activeListings,
      totalListings,
      totalOrders,
      pendingOrders,
      unreadMessages,
    };

    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      created_at: tx.createdAt.toISOString(),
    }));

    return NextResponse.json({
      stats,
      transactions: formattedTransactions,
      orders: ordersWithListing,
      listings: formattedListings,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
