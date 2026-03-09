import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Hanya ambil kategori utama (parent categories)
    const categories = await db.category.findMany({
      where: {
        isActive: true,
        parentId: null, // Filter hanya parent categories
      },
      orderBy: {
        name: 'asc', // Sort by name alphabetically
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        iconUrl: true,
        listingCount: true,
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
