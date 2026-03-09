import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/regions/provinces - Get all provinces
export async function GET() {
  try {
    const provinces = await db.province.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({
      success: true,
      provinces,
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data provinsi' },
      { status: 500 }
    );
  }
}
