import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

// GET /api/regions/regencies?provinceId=11 - Get regencies by province
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('provinceId');

    if (!provinceId) {
      return NextResponse.json(
        { success: false, message: 'provinceId diperlukan' },
        { status: 400 }
      );
    }

    const regencies = await db.regency.findMany({
      where: { provinceId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    return NextResponse.json({
      success: true,
      regencies,
    });
  } catch (error) {
    console.error('Error fetching regencies:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data kabupaten/kota' },
      { status: 500 }
    );
  }
}
