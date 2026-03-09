import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

// GET /api/regions/villages?districtId=110101 - Get villages by district
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');

    if (!districtId) {
      return NextResponse.json(
        { success: false, message: 'districtId diperlukan' },
        { status: 400 }
      );
    }

    const villages = await db.village.findMany({
      where: { districtId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        postalCode: true,
      },
    });

    return NextResponse.json({
      success: true,
      villages,
    });
  } catch (error) {
    console.error('Error fetching villages:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data desa/kelurahan' },
      { status: 500 }
    );
  }
}
