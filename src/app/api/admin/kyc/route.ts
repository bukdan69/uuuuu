import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { checkUserRole } from '@/lib/auth/checkRole';

// GET /api/admin/kyc - Get all KYC requests
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }

    // Get KYC requests with user profile
    const kycRequests = await db.kycVerification.findMany({
      where,
      include: {
        profile: {
          select: {
            name: true,
            email: true,
            provinceId: true,
            regencyId: true,
          }
        },
        documents: {
          select: {
            id: true,
            documentType: true,
            documentUrl: true,
            status: true,
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Filter by search if provided
    let filteredRequests = kycRequests;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRequests = kycRequests.filter(req =>
        req.profile.name?.toLowerCase().includes(searchLower) ||
        req.profile.email.toLowerCase().includes(searchLower) ||
        req.ktpNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Get province and regency names
    const requestsWithLocation = await Promise.all(
      filteredRequests.map(async (req) => {
        let provinceName = '-';
        let regencyName = '-';

        if (req.profile.provinceId) {
          const province = await db.province.findUnique({
            where: { id: req.profile.provinceId },
            select: { name: true }
          });
          provinceName = province?.name || '-';
        }

        if (req.profile.regencyId) {
          const regency = await db.regency.findUnique({
            where: { id: req.profile.regencyId },
            select: { name: true }
          });
          regencyName = regency?.name || '-';
        }

        return {
          ...req,
          provinceName,
          regencyName,
        };
      })
    );

    return NextResponse.json({
      requests: requestsWithLocation,
      total: requestsWithLocation.length,
    });

  } catch (error) {
    console.error('Error fetching KYC requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
