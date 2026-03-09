import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch listings for marketplace
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search');
    const provinceId = searchParams.get('provinceId');
    const regencyId = searchParams.get('regencyId');
    const priceRange = searchParams.get('priceRange');
    const condition = searchParams.get('condition');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'active', // Only show active listings
    };

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Location filters
    if (provinceId) {
      where.provinceId = provinceId;
    }

    if (regencyId) {
      where.regencyId = regencyId;
    }

    // Price range filter
    if (priceRange) {
      if (priceRange === 'under-1m') {
        where.price = { lt: 1000000 };
      } else if (priceRange === '1m-10m') {
        where.price = { gte: 1000000, lte: 10000000 };
      } else if (priceRange === '10m-50m') {
        where.price = { gte: 10000000, lte: 50000000 };
      } else if (priceRange === 'over-50m') {
        where.price = { gt: 50000000 };
      }
    }

    // Condition filter
    if (condition) {
      where.condition = condition;
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }; // default: newest
    
    if (sort === 'price-low') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-high') {
      orderBy = { price: 'desc' };
    } else if (sort === 'popular') {
      orderBy = { viewCount: 'desc' };
    }

    // Fetch listings
    const listings = await db.listing.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        condition: true,
        city: true,
        province: true,
        viewCount: true,
        favoriteCount: true,
        createdAt: true,
        isFeatured: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { imageUrl: true },
        },
      },
    });

    // Get total count for pagination
    const total = await db.listing.count({ where });

    // Format listings
    const formattedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      city: listing.city,
      province: listing.province,
      condition: listing.condition,
      viewCount: listing.viewCount,
      imageUrl: listing.images[0]?.imageUrl || null,
      isFeatured: listing.isFeatured,
      createdAt: listing.createdAt.toISOString(),
    }));

    return NextResponse.json({
      listings: formattedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

// POST - Create new listing
export async function POST(request: NextRequest) {
  try {
    // Import Supabase client
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      categoryId,
      subcategoryId,
      condition,
      city,
      province,
      listingType,
      priceType,
      videoUrl,
      rentalPrice,
      rentalPeriod,
      images,
      primaryImageIndex,
      status,
    } = body;

    // Validate required fields
    if (!title || !description || !categoryId || !city || !province) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
    
    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const slug = `${baseSlug}-${randomSuffix}`;

    // Create listing
    const listing = await db.listing.create({
      data: {
        userId: user.id, // Use authenticated user ID
        categoryId,
        subcategoryId: subcategoryId || null,
        title,
        slug,
        description,
        price: parseFloat(price) || 0,
        priceType: priceType || 'fixed',
        listingType: listingType || 'sale',
        condition: condition || 'new',
        status: status || 'active',
        city,
        province,
        videoUrl: videoUrl || null,
        rentalPrice: rentalPrice ? parseFloat(rentalPrice) : null,
        rentalPeriod: rentalPeriod || null,
        publishedAt: new Date(),
      },
    });

    // Create images if provided
    if (images && images.length > 0) {
      await db.listingImage.createMany({
        data: images.map((url: string, index: number) => ({
          listingId: listing.id,
          imageUrl: url,
          isPrimary: index === (primaryImageIndex || 0),
          sortOrder: index,
        })),
      });
    }

    // Update category listing count
    await db.category.update({
      where: { id: categoryId },
      data: { listingCount: { increment: 1 } },
    });

    // Update user's listing count
    await db.profile.update({
      where: { userId: user.id },
      data: { 
        totalListings: { increment: 1 },
        activeListings: { increment: 1 },
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
