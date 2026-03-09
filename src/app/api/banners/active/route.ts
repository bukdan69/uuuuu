import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/banners/active - Get active banners for display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    if (!position) {
      return NextResponse.json(
        { error: 'Position parameter is required' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Get active banners for the position
    const banners = await db.banner.findMany({
      where: {
        position,
        status: 'active',
        deletedAt: null,
        startsAt: {
          lte: now,
        },
        OR: [
          { endsAt: null },
          { endsAt: { gte: now } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to 10 banners for rotation
    });

    // If no banners found, return empty
    if (banners.length === 0) {
      return NextResponse.json({ banner: null });
    }

    // Select a random banner from active ones
    const randomIndex = Math.floor(Math.random() * banners.length);
    const selectedBanner = banners[randomIndex];

    // Increment impression count (fire and forget)
    db.banner.update({
      where: { id: selectedBanner.id },
      data: {
        impressions: {
          increment: 1,
        },
      },
    }).catch(err => console.error('Failed to increment impression:', err));

    // Create banner event (fire and forget)
    db.bannerEvent.create({
      data: {
        bannerId: selectedBanner.id,
        eventType: 'impression',
        costAmount: 0,
      },
    }).catch(err => console.error('Failed to create banner event:', err));

    return NextResponse.json({
      banner: {
        id: selectedBanner.id,
        title: selectedBanner.title,
        imageUrl: selectedBanner.imageUrl,
        targetUrl: selectedBanner.targetUrl,
        position: selectedBanner.position,
      },
    });
  } catch (error) {
    console.error('Error fetching active banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}
