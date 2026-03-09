import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/banners/click - Track banner click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bannerId } = body;

    if (!bannerId) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    // Increment click count (fire and forget)
    db.banner.update({
      where: { id: bannerId },
      data: {
        clicks: {
          increment: 1,
        },
      },
    }).catch(err => console.error('Failed to increment click:', err));

    // Create banner event (fire and forget)
    db.bannerEvent.create({
      data: {
        bannerId,
        eventType: 'click',
        costAmount: 0,
      },
    }).catch(err => console.error('Failed to create banner event:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking banner click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
