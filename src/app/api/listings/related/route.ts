import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const excludeId = searchParams.get('excludeId');
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'categoryId is required' },
        { status: 400 }
      );
    }

    const listings = await db.listing.findMany({
      where: {
        categoryId,
        status: 'active',
        id: { not: excludeId || undefined },
      },
      take: limit,
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        city: true,
        viewCount: true,
        isFeatured: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Error fetching related listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related listings' },
      { status: 500 }
    );
  }
}
