import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

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

    // Get user's listings
    const listings = await db.listing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        viewCount: true,
        createdAt: true,
        images: {
          select: {
            imageUrl: true,
            isPrimary: true,
          },
        },
      },
    });

    // Format listings
    const formattedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      status: listing.status,
      view_count: listing.viewCount,
      created_at: listing.createdAt.toISOString(),
      listing_images: listing.images.map(img => ({
        image_url: img.imageUrl,
        is_primary: img.isPrimary,
      })),
    }));

    return NextResponse.json({ listings: formattedListings });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
