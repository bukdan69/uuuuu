import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch categories
    const categories = await db.category.findMany({
      where: {
        isActive: true,
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        iconUrl: true,
        imageBannerUrl: true,
        listingCount: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Fetch featured listings (isFeatured = true)
    const featuredListings = await db.listing.findMany({
      where: {
        status: 'active',
        isFeatured: true,
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    // Fetch premium/boosted listings
    const boostedListings = await db.listing.findMany({
      where: {
        status: 'active',
        boosts: {
          some: {
            status: 'active',
            endsAt: { gt: new Date() },
          },
        },
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        boosts: {
          where: {
            status: 'active',
            endsAt: { gt: new Date() },
          },
          select: { boostType: true },
        },
        category: {
          select: { name: true, slug: true },
        },
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });

    // Get highlighted listing IDs (those with highlight boost)
    const highlightedListingIds = boostedListings
      .filter(l => l.boosts.some(b => b.boostType === 'highlight'))
      .map(l => l.id);

    // Fetch latest listings
    const latestListings = await db.listing.findMany({
      where: {
        status: 'active',
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
    });

    // Fetch popular listings (by view count)
    const popularListings = await db.listing.findMany({
      where: {
        status: 'active',
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
      take: 12,
      orderBy: { viewCount: 'desc' },
    });

    // Fetch active auctions
    const activeAuctions = await db.listingAuction.findMany({
      where: {
        status: 'active',
        endsAt: { gt: new Date() },
      },
      include: {
        listing: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
            category: {
              select: { name: true, slug: true },
            },
          },
        },
        bids: {
          select: { amount: true },
          orderBy: { amount: 'desc' },
          take: 1,
        },
      },
      take: 6,
      orderBy: { endsAt: 'asc' },
    });

    // Format response
    const formatListing = (listing: any) => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      price: listing.price,
      priceType: listing.priceType,
      condition: listing.condition,
      city: listing.city,
      province: listing.province,
      viewCount: listing.viewCount,
      favoriteCount: listing.favoriteCount,
      isFeatured: listing.isFeatured,
      imageUrl: listing.images[0]?.imageUrl || null,
      category: listing.category,
      createdAt: listing.createdAt,
    });

    const formatAuction = (auction: any) => ({
      id: auction.id,
      listingId: auction.listingId,
      startingPrice: auction.startingPrice,
      currentPrice: auction.currentPrice,
      buyNowPrice: auction.buyNowPrice,
      endsAt: auction.endsAt,
      totalBids: auction.totalBids,
      listing: auction.listing ? {
        id: auction.listing.id,
        title: auction.listing.title,
        slug: auction.listing.slug,
        city: auction.listing.city,
        province: auction.listing.province,
        imageUrl: auction.listing.images[0]?.imageUrl || null,
        category: auction.listing.category,
      } : null,
      highestBid: auction.bids[0]?.amount || auction.currentPrice,
    });

    return NextResponse.json({
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        iconUrl: c.iconUrl,
        imageBannerUrl: c.imageBannerUrl,
        listingCount: c.listingCount,
      })),
      featuredListings: featuredListings.map(formatListing),
      premiumBoostedListings: boostedListings.map(formatListing),
      highlightedListingIds,
      latestListings: latestListings.map(formatListing),
      popularListings: popularListings.map(formatListing),
      activeAuctions: activeAuctions.map(formatAuction),
    });
  } catch (error) {
    console.error('Error fetching landing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing data' },
      { status: 500 }
    );
  }
}
