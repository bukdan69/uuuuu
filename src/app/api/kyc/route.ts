import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

// GET /api/kyc - Get current user's KYC data
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

    // Get KYC data from database
    const kyc = await db.kycVerification.findUnique({
      where: { userId: user.id },
      include: {
        documents: true,
      },
    });

    // Get profile data for region info
    const profile = await db.profile.findUnique({
      where: { userId: user.id },
    });

    // Format response to match frontend expectations
    const formattedKyc = kyc ? {
      id: kyc.id,
      userId: kyc.userId,
      status: kyc.status,
      full_name: profile?.name || '',
      ktp_number: kyc.ktpNumber,
      provinceId: profile?.provinceId || '',
      regencyId: profile?.regencyId || '',
      districtId: profile?.districtId || '',
      villageId: profile?.villageId || '',
      full_address: profile?.address || '',
      rejection_reason: kyc.rejectionReason,
      created_at: kyc.createdAt,
      updated_at: kyc.updatedAt,
    } : null;

    return NextResponse.json({ kyc: formattedKyc });
  } catch (error) {
    console.error('Error fetching KYC:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/kyc - Submit KYC verification
export async function POST(request: NextRequest) {
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
    const {
      full_name,
      ktp_number,
      phone_number,
      provinceId,
      regencyId,
      districtId,
      villageId,
      full_address,
      ktp_image_url,
      selfie_image_url,
    } = body;

    // Validate required fields
    if (!full_name || !ktp_number || !phone_number || !provinceId || !regencyId || !ktp_image_url || !selfie_image_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if KYC already exists
    const existingKyc = await db.kycVerification.findUnique({
      where: { userId: user.id },
    });

    let kycRecord;

    if (existingKyc) {
      // Update existing KYC
      kycRecord = await db.kycVerification.update({
        where: { userId: user.id },
        data: {
          ktpNumber: ktp_number,
          status: 'pending',
          submittedAt: new Date(),
          rejectionReason: null,
        },
      });

      // Delete old documents
      await db.kycDocument.deleteMany({
        where: { kycVerificationId: kycRecord.id },
      });
    } else {
      // Create new KYC
      kycRecord = await db.kycVerification.create({
        data: {
          userId: user.id,
          ktpNumber: ktp_number,
          status: 'pending',
          submittedAt: new Date(),
        },
      });
    }

    // Create KYC documents
    await db.kycDocument.createMany({
      data: [
        {
          kycVerificationId: kycRecord.id,
          documentType: 'ktp',
          documentUrl: ktp_image_url,
          status: 'pending',
        },
        {
          kycVerificationId: kycRecord.id,
          documentType: 'selfie',
          documentUrl: selfie_image_url,
          status: 'pending',
        },
      ],
    });

    // Update profile with region and address data
    await db.profile.update({
      where: { userId: user.id },
      data: {
        name: full_name,
        phone: phone_number,
        provinceId,
        regencyId,
        districtId,
        villageId,
        address: full_address,
      },
    });

    // Fetch updated KYC with documents
    const updatedKyc = await db.kycVerification.findUnique({
      where: { id: kycRecord.id },
      include: {
        documents: true,
      },
    });

    // Get profile data
    const profile = await db.profile.findUnique({
      where: { userId: user.id },
    });

    // Format response to match frontend expectations
    const formattedKyc = {
      id: updatedKyc!.id,
      userId: updatedKyc!.userId,
      status: updatedKyc!.status,
      full_name: profile?.name || '',
      ktp_number: updatedKyc!.ktpNumber,
      provinceId: profile?.provinceId || '',
      regencyId: profile?.regencyId || '',
      districtId: profile?.districtId || '',
      villageId: profile?.villageId || '',
      full_address: profile?.address || '',
      rejection_reason: updatedKyc!.rejectionReason,
      created_at: updatedKyc!.createdAt,
      updated_at: updatedKyc!.updatedAt,
    };

    return NextResponse.json({
      success: true,
      kyc: formattedKyc,
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


