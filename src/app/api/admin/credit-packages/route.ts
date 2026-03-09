import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

// Helper function to check if user is admin
async function checkAdminRole(userId: string): Promise<boolean> {
  const userRole = await db.userRole.findFirst({
    where: { userId, role: 'admin' },
  });
  return !!userRole;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const where = activeOnly ? { isActive: true } : {};

    const packages = await db.creditPackage.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for demo/mock authentication (development mode)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      userId = authHeader.substring(7);
    } else {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, credits, price, bonusCredits, isActive, sortOrder } = body;

    if (!name || !credits || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newPackage = await db.creditPackage.create({
      data: {
        name,
        credits: parseInt(credits),
        price: parseFloat(price),
        bonusCredits: parseInt(bonusCredits) || 0,
        isActive: isActive !== false,
        sortOrder: parseInt(sortOrder) || 0,
      },
    });

    return NextResponse.json({ package: newPackage });
  } catch (error) {
    console.error('Error creating credit package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check for demo/mock authentication (development mode)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      userId = authHeader.substring(7);
    } else {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, credits, price, bonusCredits, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    const updatedPackage = await db.creditPackage.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(credits !== undefined && { credits: parseInt(credits) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(bonusCredits !== undefined && { bonusCredits: parseInt(bonusCredits) }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
      },
    });

    return NextResponse.json({ package: updatedPackage });
  } catch (error) {
    console.error('Error updating credit package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
