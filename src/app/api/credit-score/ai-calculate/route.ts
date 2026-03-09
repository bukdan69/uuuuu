import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { fetchSlikData, calculateSlikScore } from '@/lib/integrations/slik-ojk';
import {
  fetchFacebookData,
  fetchInstagramData,
  fetchLinkedInData,
  calculateSocialMediaScore,
  analyzeSocialMediaPatterns,
} from '@/lib/integrations/social-media';
import { predictCreditScore, AIFeatures } from '@/lib/ai/credit-scoring-ai';

/**
 * AI-Powered Credit Score Calculation
 * POST /api/credit-score/ai-calculate
 * 
 * Integrates:
 * 1. Platform data (transactions, ratings, etc.)
 * 2. SLIK OJK data (credit history)
 * 3. Social media data (Facebook, Instagram, LinkedIn)
 * 4. AI model prediction
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body (optional social media tokens)
    const body = await request.json();
    const {
      facebookToken,
      instagramToken,
      linkedinToken,
      ktpNumber, // For SLIK OJK lookup
    } = body;

    // 1. Fetch platform data
    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      include: {
        umkmProfile: true,
        kyc: true,
        listings: {
          where: { deletedAt: null },
        },
        ordersAsSeller: {
          where: { status: 'completed' },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 2. Fetch SLIK OJK data (if KTP number provided)
    let slikData = null;
    let slikScore = null;
    if (ktpNumber && profile.kyc?.status === 'approved') {
      slikData = await fetchSlikData(ktpNumber);
      slikScore = calculateSlikScore(slikData);
    }

    // 3. Fetch social media data (if tokens provided)
    const socialMediaData: any = {};
    if (facebookToken) {
      socialMediaData.facebook = await fetchFacebookData(facebookToken);
    }
    if (instagramToken) {
      socialMediaData.instagram = await fetchInstagramData(instagramToken);
    }
    if (linkedinToken) {
      socialMediaData.linkedin = await fetchLinkedInData(linkedinToken);
    }

    const socialMediaScore = calculateSocialMediaScore(socialMediaData);
    const socialMediaAnalysis = analyzeSocialMediaPatterns(socialMediaData);

    // 4. Prepare AI features
    const businessDurationMonths = Math.floor(
      (Date.now() - profile.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    const completedOrders = profile.ordersAsSeller.length;
    const totalRevenue = profile.totalSales;
    const monthlyAverageRevenue = businessDurationMonths > 0 ? totalRevenue / businessDurationMonths : 0;

    const aiFeatures: AIFeatures = {
      // Platform data
      businessDurationMonths,
      totalRevenue,
      monthlyAverageRevenue,
      transactionCount: completedOrders,
      activeListings: profile.activeListings,
      averageRating: profile.averageRating,
      totalReviews: profile.totalReviews,
      completionRate: completedOrders > 0 ? 1.0 : 0, // Simplified
      responseRate: 0.85, // Mock - would track actual response time
      disputeRate: 0.02, // Mock - would track actual disputes
      
      // SLIK OJK data
      slikCreditScore: slikData?.creditScore || 0,
      slikTotalDebt: slikData?.totalDebt || 0,
      slikMonthlyInstallment: slikData?.monthlyInstallment || 0,
      slikActiveLoans: slikData?.activeLoans || 0,
      slikOnTimePaymentRate: slikData
        ? slikData.paymentHistory.onTime /
          (slikData.paymentHistory.onTime + slikData.paymentHistory.late + slikData.paymentHistory.defaulted || 1)
        : 0,
      slikDebtToIncomeRatio: monthlyAverageRevenue > 0
        ? (slikData?.monthlyInstallment || 0) / monthlyAverageRevenue
        : 0,
      slikKolektibilitas: slikData?.creditScore || 0,
      
      // Social media data
      facebookFriendsCount: socialMediaData.facebook?.friendsCount || 0,
      facebookHasBusinessPage: socialMediaData.facebook?.hasBusinessPage ? 1 : 0,
      instagramFollowersCount: socialMediaData.instagram?.followersCount || 0,
      instagramEngagementRate: socialMediaData.instagram?.engagementRate || 0,
      linkedinConnectionsCount: socialMediaData.linkedin?.connectionsCount || 0,
      socialMediaVerified:
        (socialMediaData.facebook?.verified ? 1 : 0) +
        (socialMediaData.instagram?.verified ? 1 : 0) +
        (socialMediaData.linkedin?.verified ? 1 : 0) > 0
          ? 1
          : 0,
      socialMediaSuspicious: socialMediaAnalysis.isSuspicious ? 1 : 0,
      
      // KYC & documents
      kycVerified: profile.isKycVerified ? 1 : 0,
      hasNPWP: profile.umkmProfile?.npwp ? 1 : 0,
      hasNIB: profile.umkmProfile?.nib ? 1 : 0,
      umkmVerified: profile.umkmProfile?.isVerified ? 1 : 0,
      documentCompleteness: calculateDocumentCompleteness(profile),
      
      // Behavioral data (mock - would track actual behavior)
      loginFrequency: 15, // logins per month
      avgSessionDuration: 25, // minutes
      mobileAppUsage: 1,
      nighttimeActivity: 0.1, // 10% of activity at night
      locationConsistency: 0.9, // 90% consistent location
    };

    // 5. Run AI prediction
    const aiPrediction = predictCreditScore(aiFeatures);

    // 6. Save to database
    const creditScore = await db.creditScore.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totalScore: aiPrediction.score,
        businessDurationScore: Math.round(aiFeatures.businessDurationMonths / 36 * 15),
        revenueScore: Math.round(Math.min(totalRevenue / 25000000, 1) * 20),
        transactionScore: Math.round(Math.min(completedOrders / 100, 1) * 20),
        ratingScore: Math.round((profile.averageRating / 5) * 15),
        kycScore: profile.isKycVerified ? 10 : 0,
        assetScore: calculateAssetScore(profile.umkmProfile),
        paymentHistoryScore: slikScore?.paymentBehaviorScore || 0,
        eligibilityStatus: getEligibilityStatus(aiPrediction.score),
        riskLevel: aiPrediction.riskLevel,
        recommendedLoanAmount: calculateRecommendedLoan(aiPrediction.score, totalRevenue),
        lastCalculatedAt: new Date(),
      },
      update: {
        totalScore: aiPrediction.score,
        businessDurationScore: Math.round(aiFeatures.businessDurationMonths / 36 * 15),
        revenueScore: Math.round(Math.min(totalRevenue / 25000000, 1) * 20),
        transactionScore: Math.round(Math.min(completedOrders / 100, 1) * 20),
        ratingScore: Math.round((profile.averageRating / 5) * 15),
        kycScore: profile.isKycVerified ? 10 : 0,
        assetScore: calculateAssetScore(profile.umkmProfile),
        paymentHistoryScore: slikScore?.paymentBehaviorScore || 0,
        eligibilityStatus: getEligibilityStatus(aiPrediction.score),
        riskLevel: aiPrediction.riskLevel,
        recommendedLoanAmount: calculateRecommendedLoan(aiPrediction.score, totalRevenue),
        lastCalculatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      creditScore,
      aiPrediction: {
        score: aiPrediction.score,
        probability: aiPrediction.probability,
        riskLevel: aiPrediction.riskLevel,
        confidence: aiPrediction.confidence,
        explainability: aiPrediction.explainability,
        recommendations: aiPrediction.recommendations,
      },
      dataSources: {
        platform: true,
        slik: !!slikData,
        socialMedia: {
          facebook: !!socialMediaData.facebook,
          instagram: !!socialMediaData.instagram,
          linkedin: !!socialMediaData.linkedin,
        },
      },
      socialMediaAnalysis: socialMediaAnalysis.isSuspicious
        ? {
            warning: 'Pola media sosial mencurigakan terdeteksi',
            reasons: socialMediaAnalysis.reasons,
          }
        : null,
    });
  } catch (error) {
    console.error('Error calculating AI credit score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function calculateDocumentCompleteness(profile: any): number {
  let score = 0;
  let total = 0;

  if (profile.name) score++;
  total++;
  if (profile.phone) score++;
  total++;
  if (profile.address) score++;
  total++;
  if (profile.isKycVerified) score++;
  total++;
  if (profile.umkmProfile) score++;
  total++;

  return score / total;
}

function calculateAssetScore(umkmProfile: any): number {
  let score = 0;
  if (umkmProfile) {
    score += 3;
    if (umkmProfile.npwp) score += 3;
    if (umkmProfile.nib) score += 2;
    if (umkmProfile.isVerified) score += 2;
  }
  return Math.min(score, 10);
}

function getEligibilityStatus(score: number): string {
  if (score >= 85) return 'highly_eligible';
  if (score >= 70) return 'eligible';
  if (score >= 50) return 'review_needed';
  return 'not_eligible';
}

function calculateRecommendedLoan(score: number, totalSales: number): number {
  let maxLoan = 0;
  if (score >= 85) {
    maxLoan = Math.min(totalSales * 0.6, 50000000);
  } else if (score >= 70) {
    maxLoan = Math.min(totalSales * 0.4, 25000000);
  } else if (score >= 50) {
    maxLoan = Math.min(totalSales * 0.2, 10000000);
  }
  return Math.floor(maxLoan / 1000000) * 1000000;
}
