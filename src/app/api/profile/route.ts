import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

// GET /api/profile - Get current user's profile and KYC data
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get profile data
    const profile = await db.profile.findUnique({
      where: { userId: user.id },
    });

    // Get region names if IDs exist
    let provinceName = '';
    let regencyName = '';
    let districtName = '';
    let villageName = '';

    if (profile?.provinceId) {
      const province = await db.province.findUnique({
        where: { id: profile.provinceId },
      });
      provinceName = province?.name || '';
    }

    if (profile?.regencyId) {
      const regency = await db.regency.findUnique({
        where: { id: profile.regencyId },
      });
      regencyName = regency?.name || '';
    }

    if (profile?.districtId) {
      const district = await db.district.findUnique({
        where: { id: profile.districtId },
      });
      districtName = district?.name || '';
    }

    if (profile?.villageId) {
      const village = await db.village.findUnique({
        where: { id: profile.villageId },
      });
      villageName = village?.name || '';
    }

    // Get KYC data
    const kyc = await db.kycVerification.findUnique({
      where: { userId: user.id },
      include: {
        documents: true,
      },
    });

    // Format KYC data with region names
    const formattedKyc = kyc ? {
      id: kyc.id,
      full_name: profile?.name || '',
      ktp_number: kyc.ktpNumber,
      province: provinceName,
      city: regencyName,
      district: districtName,
      village: villageName,
      full_address: profile?.address || '',
      ktp_image_url: kyc.documents?.find(d => d.documentType === 'ktp')?.documentUrl || null,
      selfie_image_url: kyc.documents?.find(d => d.documentType === 'selfie')?.documentUrl || null,
      status: kyc.status,
      rejection_reason: kyc.rejectionReason,
    } : null;

    // Use KYC data as fallback for profile if profile fields are empty
    const displayName = profile?.name || formattedKyc?.full_name || null;
    const displayPhone = profile?.phone || null;
    const displayAddress = profile?.address || formattedKyc?.full_address || null;

    return NextResponse.json({
      profile: {
        id: profile?.id || '',
        name: displayName,
        email: user.email || null,
        phone_number: displayPhone,
        address: displayAddress,
        postal_code: profile?.postalCode || null,
        avatar_url: profile?.avatarUrl || null,
      },
      kyc: formattedKyc,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone_number, address, postal_code, avatar_url } = body;

    // Update profile
    const updatedProfile = await db.profile.update({
      where: { userId: user.id },
      data: {
        name: name || undefined,
        phone: phone_number || undefined,
        address: address || undefined,
        postalCode: postal_code || undefined,
        avatarUrl: avatar_url || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: user.email,
        phone_number: updatedProfile.phone,
        address: updatedProfile.address,
        postal_code: updatedProfile.postalCode,
        avatar_url: updatedProfile.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
