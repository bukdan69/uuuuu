import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Update listing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      price,
      categoryId,
      condition,
      city,
      province,
      listingType,
      images,
      primaryImageIndex,
      status,
    } = body;

    // Check if listing exists
    const existingListing = await db.listing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);

    // Update listing
    const listing = await db.listing.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        price: parseFloat(price) || 0,
        categoryId,
        condition: condition || 'new',
        city,
        province,
        listingType: listingType || 'sale',
        status: status || existingListing.status,
      },
    });

    // Update images if provided
    if (images && images.length > 0) {
      // Delete existing images
      await db.listingImage.deleteMany({
        where: { listingId: id },
      });

      // Create new images
      await db.listingImage.createMany({
        data: images.map((url: string, index: number) => ({
          listingId: id,
          imageUrl: url,
          isPrimary: index === (primaryImageIndex || 0),
          sortOrder: index,
        })),
      });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// DELETE - Delete listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if listing exists
    const existingListing = await db.listing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to deleted
    await db.listing.update({
      where: { id },
      data: {
        status: 'deleted',
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get listing with all related data
    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            userId: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            city: true,
            province: true,
            isVerified: true,
            averageRating: true,
            totalReviews: true,
            totalListings: true,
            soldCount: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        auction: {
          include: {
            bids: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
        boosts: {
          where: {
            status: 'active',
            endsAt: { gt: new Date() },
          },
        },
        savedBy: {
          select: { userId: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Get similar listings from same category
    const similarListings = await db.listing.findMany({
      where: {
        categoryId: listing.categoryId,
        status: 'active',
        id: { not: id },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    // Check if listing is saved by current user (if authenticated)
    // For now, return false
    const isSaved = false;

    return NextResponse.json({
      listing: {
        ...listing,
        isSaved,
        savedCount: listing.savedBy.length,
      },
      similarListings,
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}
