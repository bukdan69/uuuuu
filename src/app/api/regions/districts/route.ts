import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

// GET /api/regions/districts?regencyId=1101 - Get districts by regency
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regencyId = searchParams.get('regencyId');

    if (!regencyId) {
      return NextResponse.json(
        { success: false, message: 'regencyId diperlukan' },
        { status: 400 }
      );
    }

    const districts = await db.district.findMany({
      where: { regencyId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({
      success: true,
      districts,
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data kecamatan' },
      { status: 500 }
    );
  }
}
