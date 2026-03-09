import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import UserListings from './UserListings';
import { LocationMap } from '@/components/maps/LocationMap';
import { 
  MapPin, Calendar, Package, Star, ShoppingBag, 
  Eye, Globe, Instagram, Facebook, MessageCircle,
  CheckCircle2, Store, Phone, Mail
} from 'lucide-react';

interface PageProps {
  params: Promise<{ username: string }>;
}

async function getUserProfile(identifier: string) {
  // First, try to find UMKM profile by slug
  const umkmProfile = await db.umkmProfile.findFirst({
    where: { slug: identifier },
    include: {
      owner: {
        include: {
          listings: {
            where: {
              deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
              images: {
                take: 1,
                orderBy: { sortOrder: 'asc' },
              },
              category: true,
            },
          },
        },
      },
    },
  });

  if (umkmProfile) {
    // Fetch location details if IDs exist
    let locationDetails = null;
    if (umkmProfile.provinceId || umkmProfile.owner.provinceId) {
      const provinceId = umkmProfile.provinceId || umkmProfile.owner.provinceId;
      const regencyId = umkmProfile.regencyId || umkmProfile.owner.regencyId;
      const districtId = umkmProfile.owner.districtId;
      const villageId = umkmProfile.owner.villageId;

      const [province, regency, district, village] = await Promise.all([
        provinceId ? db.province.findUnique({ where: { id: provinceId } }) : null,
        regencyId ? db.regency.findUnique({ where: { id: regencyId } }) : null,
        districtId ? db.district.findUnique({ where: { id: districtId } }) : null,
        villageId ? db.village.findUnique({ where: { id: villageId } }) : null,
      ]);

      locationDetails = { province, regency, district, village };
    }

    return {
      type: 'umkm' as const,
      profile: umkmProfile.owner,
      umkm: umkmProfile,
      listings: umkmProfile.owner.listings,
      locationDetails,
    };
  }

  // Fallback: Try to find regular profile
  const profile = await db.profile.findFirst({
    where: {
      OR: [
        { userId: identifier },
        { name: { contains: identifier, mode: 'insensitive' } },
      ],
    },
    include: {
      listings: {
        where: {
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          images: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
          },
          category: true,
        },
      },
    },
  });

  if (profile) {
    // Fetch location details if IDs exist
    let locationDetails = null;
    if (profile.provinceId) {
      const [province, regency, district, village] = await Promise.all([
        profile.provinceId ? db.province.findUnique({ where: { id: profile.provinceId } }) : null,
        profile.regencyId ? db.regency.findUnique({ where: { id: profile.regencyId } }) : null,
        profile.districtId ? db.district.findUnique({ where: { id: profile.districtId } }) : null,
        profile.villageId ? db.village.findUnique({ where: { id: profile.villageId } }) : null,
      ]);

      locationDetails = { province, regency, district, village };
    }

    return {
      type: 'user' as const,
      profile,
      listings: profile.listings,
      locationDetails,
    };
  }

  return null;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const data = await getUserProfile(username);

  if (!data) {
    notFound();
  }

  const { type, profile, umkm, listings, locationDetails } = data;
  
  const displayName = type === 'umkm' ? umkm!.umkmName : (profile.name || 'User');
  const displayBio = type === 'umkm' ? umkm!.description : profile.bio;
  const displayCity = type === 'umkm' ? umkm!.city : profile.city;
  const displayAvatar = type === 'umkm' ? umkm!.logoUrl : profile.avatarUrl;
  const isVerified = type === 'umkm' ? umkm!.isVerified : profile.isVerified;

  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'active').length,
    totalViews: listings.reduce((sum, l) => sum + l.viewCount, 0),
    totalFavorites: listings.reduce((sum, l) => sum + l.favoriteCount, 0),
  };

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={displayAvatar || undefined} />
              <AvatarFallback className="text-2xl bg-white text-blue-600">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                {isVerified && (
                  <CheckCircle2 className="h-6 w-6 text-green-400" title="Terverifikasi" />
                )}
                {type === 'umkm' && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Store className="h-3 w-3 mr-1" />
                    UMKM
                  </Badge>
                )}
              </div>
              
              {type === 'umkm' && umkm!.tagline && (
                <p className="text-blue-100 mb-2 italic">{umkm!.tagline}</p>
              )}
              
              {displayBio && (
                <p className="text-white/90 mb-4 max-w-2xl">{displayBio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm mb-4">
                {displayCity && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {displayCity}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Bergabung {new Date(profile.createdAt).toLocaleDateString('id-ID', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>

              {/* UMKM Contact Info */}
              {type === 'umkm' && (
                <div className="flex flex-wrap gap-2">
                  {umkm!.website && (
                    <Button variant="secondary" size="sm" asChild className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Link href={umkm!.website} target="_blank">
                        <Globe className="h-4 w-4 mr-1" />
                        Website
                      </Link>
                    </Button>
                  )}
                  {umkm!.instagram && (
                    <Button variant="secondary" size="sm" asChild className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Link href={`https://instagram.com/${umkm!.instagram}`} target="_blank">
                        <Instagram className="h-4 w-4 mr-1" />
                        Instagram
                      </Link>
                    </Button>
                  )}
                  {umkm!.whatsapp && (
                    <Button variant="secondary" size="sm" asChild className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Link href={`https://wa.me/${umkm!.whatsapp}`} target="_blank">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Link>
                    </Button>
                  )}
                  {umkm!.phone && (
                    <Button variant="secondary" size="sm" asChild className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Link href={`tel:${umkm!.phone}`}>
                        <Phone className="h-4 w-4 mr-1" />
                        {umkm!.phone}
                      </Link>
                    </Button>
                  )}
                  {umkm!.email && (
                    <Button variant="secondary" size="sm" asChild className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Link href={`mailto:${umkm!.email}`}>
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalListings}</p>
                  <p className="text-sm text-muted-foreground">Total Listing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeListings}</p>
                  <p className="text-sm text-muted-foreground">Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalFavorites}</p>
                  <p className="text-sm text-muted-foreground">Favorit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content - Listings */}
          <div className="flex-1">
            <UserListings
              listings={listings.map((listing) => ({
                id: listing.id,
                title: listing.title,
                slug: listing.slug,
                price: listing.price,
                priceType: listing.priceType,
                condition: listing.condition,
                city: listing.city || '',
                province: listing.province || '',
                imageUrl: listing.images[0]?.imageUrl || '/placeholder.jpg',
                viewCount: listing.viewCount,
                favoriteCount: listing.favoriteCount,
                isFeatured: listing.isFeatured,
                createdAt: listing.createdAt.toISOString(),
                category: listing.category?.name || '',
                status: listing.status,
              }))}
              activeCount={stats.activeListings}
              totalCount={stats.totalListings}
            />
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* Profile Info Card */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-sm">Informasi {type === 'umkm' ? 'UMKM' : 'Pengguna'}</h3>
                  <div className="space-y-3 text-sm">
                    {/* Lokasi */}
                    {displayCity && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Lokasi</p>
                          <p className="font-medium">{displayCity}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Alamat Lengkap dengan Wilayah */}
                    {locationDetails && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Alamat Lengkap</p>
                          <div className="space-y-1 text-xs">
                            {(type === 'umkm' ? umkm!.address : profile.address) && (
                              <p className="font-medium">{type === 'umkm' ? umkm!.address : profile.address}</p>
                            )}
                            {locationDetails.village && (
                              <p className="text-muted-foreground">
                                <span className="font-medium">Kelurahan/Desa:</span> {locationDetails.village.name}
                              </p>
                            )}
                            {locationDetails.district && (
                              <p className="text-muted-foreground">
                                <span className="font-medium">Kecamatan:</span> {locationDetails.district.name}
                              </p>
                            )}
                            {locationDetails.regency && (
                              <p className="text-muted-foreground">
                                <span className="font-medium">Kabupaten/Kota:</span> {locationDetails.regency.type} {locationDetails.regency.name}
                              </p>
                            )}
                            {locationDetails.province && (
                              <p className="text-muted-foreground">
                                <span className="font-medium">Provinsi:</span> {locationDetails.province.name}
                              </p>
                            )}
                            {(type === 'umkm' ? umkm!.postalCode : profile.postalCode) && (
                              <p className="text-muted-foreground">
                                <span className="font-medium">Kode Pos:</span> {type === 'umkm' ? umkm!.postalCode : profile.postalCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Alamat Sederhana (jika tidak ada locationDetails) */}
                    {!locationDetails && (type === 'umkm' ? umkm!.address : profile.address) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Alamat</p>
                          <p className="font-medium text-xs leading-relaxed">
                            {type === 'umkm' ? umkm!.address : profile.address}
                            {(type === 'umkm' ? umkm!.postalCode : profile.postalCode) && (
                              <span className="block mt-1">Kode Pos: {type === 'umkm' ? umkm!.postalCode : profile.postalCode}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Nomor Telepon */}
                    {(type === 'umkm' ? umkm!.phone : profile.phone) && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Telepon</p>
                          <a 
                            href={`tel:${type === 'umkm' ? umkm!.phone : profile.phone}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {type === 'umkm' ? umkm!.phone : profile.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {(type === 'umkm' ? umkm!.email : profile.email) && (
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <a 
                            href={`mailto:${type === 'umkm' ? umkm!.email : profile.email}`}
                            className="font-medium text-blue-600 hover:underline break-all"
                          >
                            {type === 'umkm' ? umkm!.email : profile.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Website (untuk user biasa) */}
                    {type === 'user' && profile.website && (
                      <div className="flex items-start gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Website</p>
                          <a 
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline break-all"
                          >
                            {profile.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Kategori Bisnis (UMKM) */}
                    {type === 'umkm' && umkm!.category && (
                      <div className="flex items-start gap-2">
                        <Store className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Kategori Bisnis</p>
                          <p className="font-medium">{umkm!.category}</p>
                          {umkm!.subcategory && (
                            <p className="text-xs text-muted-foreground mt-0.5">{umkm!.subcategory}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skala Bisnis (UMKM) */}
                    {type === 'umkm' && umkm!.businessScale && (
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Skala Bisnis</p>
                          <p className="font-medium capitalize">{umkm!.businessScale}</p>
                        </div>
                      </div>
                    )}

                    {/* Bergabung */}
                    <div className="flex items-start gap-2 pt-2 border-t">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Bergabung</p>
                        <p className="font-medium">
                          {new Date(profile.createdAt).toLocaleDateString('id-ID', { 
                            day: 'numeric',
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Status Verifikasi */}
                    {isVerified && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium text-xs">Akun Terverifikasi</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* UMKM Contact Card */}
              {type === 'umkm' && (umkm!.website || umkm!.instagram || umkm!.whatsapp || umkm!.phone || umkm!.email) && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 text-sm">Hubungi Kami</h3>
                    <div className="space-y-2">
                      {umkm!.website && (
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                          <Link href={umkm!.website} target="_blank">
                            <Globe className="h-4 w-4 mr-2" />
                            Website
                          </Link>
                        </Button>
                      )}
                      {umkm!.instagram && (
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                          <Link href={`https://instagram.com/${umkm!.instagram}`} target="_blank">
                            <Instagram className="h-4 w-4 mr-2" />
                            Instagram
                          </Link>
                        </Button>
                      )}
                      {umkm!.whatsapp && (
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                          <Link href={`https://wa.me/${umkm!.whatsapp}`} target="_blank">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            WhatsApp
                          </Link>
                        </Button>
                      )}
                      {umkm!.phone && (
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                          <Link href={`tel:${umkm!.phone}`}>
                            <Phone className="h-4 w-4 mr-2" />
                            {umkm!.phone}
                          </Link>
                        </Button>
                      )}
                      {umkm!.email && (
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                          <Link href={`mailto:${umkm!.email}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* LocationIQ Maps Card */}
              {(displayCity || (type === 'umkm' ? umkm!.address : profile.address)) && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Lokasi
                    </h3>
                    <LocationMap
                      address={type === 'umkm' ? umkm!.address : profile.address}
                      city={displayCity}
                      province={locationDetails?.province?.name}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Stats Summary Card */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-sm">Statistik</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Listing</span>
                      <span className="font-bold">{stats.totalListings}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Listing Aktif</span>
                      <span className="font-bold text-green-600">{stats.activeListings}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Views</span>
                      <span className="font-bold">{stats.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Favorit</span>
                      <span className="font-bold">{stats.totalFavorites}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
