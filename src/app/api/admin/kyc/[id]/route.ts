import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity, ActivityType } from '@/lib/activityLog';

// PATCH /api/admin/kyc/[id] - Approve or reject KYC
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await params;
    
    console.log('🔍 KYC Approval API called');
    console.log('KYC ID:', id);
    
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('User:', user?.email);

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

    const body = await request.json();
    const { action, rejectionReason } = body; // action: 'approve' or 'reject'
    
    console.log('Action:', action);
    console.log('Rejection Reason:', rejectionReason);

    if (!action || !['approve', 'reject'].includes(action)) {
      console.log('❌ Invalid action');
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get KYC request
    console.log('Fetching KYC request...');
    const kycRequest = await db.kycVerification.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    console.log('KYC Request found:', kycRequest ? 'Yes' : 'No');

    if (!kycRequest) {
      console.log('❌ KYC request not found');
      return NextResponse.json(
        { error: 'KYC request not found' },
        { status: 404 }
      );
    }

    // Update KYC status
    console.log('Updating KYC status...');
    const updatedKyc = await db.kycVerification.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: user.id,
        reviewedAt: new Date(),
        rejectionReason: action === 'reject' ? rejectionReason : null,
      }
    });

    // Update profile isKycVerified if approved
    if (action === 'approve') {
      console.log('Updating profile isKycVerified...');
      await db.profile.update({
        where: { userId: kycRequest.userId },
        data: { isKycVerified: true }
      });
      console.log('✅ Profile updated');
    }

    // Log activity
    console.log('Logging activity...');
    await logActivity({
      userId: user.id,
      userEmail: user.email || 'admin',
      action: action === 'approve' ? ActivityType.APPROVE_KYC : ActivityType.REJECT_KYC,
      description: `${action === 'approve' ? 'Menyetujui' : 'Menolak'} KYC untuk ${kycRequest.profile.name || kycRequest.profile.email}`,
      metadata: {
        kycId: id,
        targetUserId: kycRequest.userId,
        rejectionReason: action === 'reject' ? rejectionReason : undefined,
      }
    });
    
    console.log('✅ Activity logged');
    console.log('✅ KYC approval successful');

    return NextResponse.json({
      success: true,
      kyc: updatedKyc,
    });

  } catch (error) {
    console.error('❌ Error updating KYC:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
