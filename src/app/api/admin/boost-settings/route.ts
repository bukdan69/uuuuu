import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity } from '@/lib/activityLog';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch boost types
    const boostTypes = await db.boostType.findMany({
      orderBy: { creditsPerDay: 'asc' },
    });

    // Fetch all platform settings
    const allSettings = await db.platformSetting.findMany({
      orderBy: { key: 'asc' },
    });

    // Filter credit-related settings
    const creditSettings = allSettings.filter(
      (s) =>
        (s.key.includes('credit') ||
          s.key.includes('cost') ||
          s.key.includes('fee') ||
          s.key.includes('initial')) &&
        s.key !== 'premium_homepage_count'
    );

    // Get premium homepage count
    const premiumHomepageSetting = allSettings.find(
      (s) => s.key === 'premium_homepage_count'
    );
    let premiumCount = 6;
    if (premiumHomepageSetting?.value) {
      try {
        const parsed = JSON.parse(premiumHomepageSetting.value);
        if (parsed.amount) premiumCount = parsed.amount;
      } catch {
        // Use default
      }
    }

    // Fetch active boosts
    const activeBoosts = await db.listingBoost.findMany({
      where: {
        status: 'active',
        endsAt: {
          gte: new Date(),
        },
      },
      include: {
        listing: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      boostTypes,
      creditSettings,
      premiumCount,
      activeBoosts,
    });
  } catch (error) {
    console.error('Error fetching boost settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, data } = body;

    if (action === 'update_boost_type') {
      // Update boost type
      const { id, name, description, creditsPerDay, multiplier, isActive } = data;
      
      await db.boostType.update({
        where: { id },
        data: {
          name,
          description,
          creditsPerDay,
          multiplier,
          isActive,
        },
      });

      await logActivity({
        userId: user.id,
        userEmail: user.email || '',
        action: 'update_boost_type',
        description: `Memperbarui tipe boost: ${name}`,
        metadata: { boostTypeId: id },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'update_platform_setting') {
      // Update platform setting
      const { id, value } = data;
      
      await db.platformSetting.update({
        where: { id },
        data: {
          value: JSON.stringify(value),
          updatedBy: user.id,
        },
      });

      await logActivity({
        userId: user.id,
        userEmail: user.email || '',
        action: 'update_platform_setting',
        description: 'Memperbarui pengaturan platform',
        metadata: { settingId: id },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'update_premium_count') {
      // Update premium homepage count
      const { count } = data;
      
      await db.platformSetting.upsert({
        where: { key: 'premium_homepage_count' },
        update: {
          value: JSON.stringify({ amount: count }),
          updatedBy: user.id,
        },
        create: {
          key: 'premium_homepage_count',
          value: JSON.stringify({ amount: count }),
          description: 'Jumlah card premium di homepage',
          updatedBy: user.id,
        },
      });

      await logActivity({
        userId: user.id,
        userEmail: user.email || '',
        action: 'update_premium_count',
        description: `Mengubah jumlah card premium di homepage: ${count}`,
        metadata: { count },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error saving boost settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
