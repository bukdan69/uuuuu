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

    // Get saved listings
    const savedListings = await db.savedListing.findMany({
      where: { userId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            priceType: true,
            condition: true,
            status: true,
            city: true,
            province: true,
            viewCount: true,
            isFeatured: true,
            createdAt: true,
            images: {
              where: { isPrimary: true },
              select: { imageUrl: true, isPrimary: true },
              take: 1,
            },
            category: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedListings = savedListings.map((saved) => ({
      id: saved.id,
      created_at: saved.createdAt.toISOString(),
      listing: {
        id: saved.listing.id,
        title: saved.listing.title,
        price: saved.listing.price,
        price_type: saved.listing.priceType,
        condition: saved.listing.condition,
        status: saved.listing.status,
        city: saved.listing.city,
        province: saved.listing.province,
        view_count: saved.listing.viewCount,
        is_featured: saved.listing.isFeatured,
        created_at: saved.listing.createdAt.toISOString(),
        listing_images: saved.listing.images.map((img) => ({
          image_url: img.imageUrl,
          is_primary: img.isPrimary,
        })),
        categories: saved.listing.category,
      },
    }));

    return NextResponse.json({ savedListings: formattedListings });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { savedId } = await request.json();

    if (!savedId) {
      return NextResponse.json({ error: 'savedId is required' }, { status: 400 });
    }

    // Verify ownership
    const savedListing = await db.savedListing.findUnique({
      where: { id: savedId },
      select: { userId: true },
    });

    if (!savedListing || savedListing.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.savedListing.delete({
      where: { id: savedId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
