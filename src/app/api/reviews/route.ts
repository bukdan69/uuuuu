import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json(
        { error: 'sellerId is required' },
        { status: 400 }
      );
    }

    // Get reviews from seller's listings
    const reviews = await db.review.findMany({
      where: {
        listing: {
          userId: sellerId,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        reviewer: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Calculate stats
    const allReviews = await db.review.findMany({
      where: {
        listing: {
          userId: sellerId,
        },
      },
      select: { rating: true },
    });

    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    return NextResponse.json({
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        reviewer: {
          name: r.reviewer?.name || 'Anonim',
          avatarUrl: r.reviewer?.avatarUrl,
        },
      })),
      totalReviews,
      averageRating,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, rating, comment } = body;

    if (!listingId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const review = await db.review.create({
      data: {
        listingId,
        reviewerId: 'demo-user', // In production, get from auth
        rating: parseInt(rating),
        comment,
      },
      include: {
        reviewer: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
