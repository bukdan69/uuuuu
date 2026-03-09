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

// GET - Fetch platform settings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all settings
    const settings = await db.platformSetting.findMany();

    // Convert to key-value object
    const settingsObj: Record<string, any> = {};
    settings.forEach((setting) => {
      try {
        // Try to parse as JSON first
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        // If not JSON, use as string
        settingsObj[setting.key] = setting.value;
      }
    });

    return NextResponse.json({ settings: settingsObj });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Update platform settings
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { key, value, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Convert value to string (JSON if object/array)
    const valueStr = typeof value === 'object' 
      ? JSON.stringify(value) 
      : String(value);

    // Upsert setting
    const setting = await db.platformSetting.upsert({
      where: { key },
      update: {
        value: valueStr,
        description: description || undefined,
        updatedBy: user.id,
        updatedAt: new Date(),
      },
      create: {
        key,
        value: valueStr,
        description: description || undefined,
        updatedBy: user.id,
      },
    });

    // Get user email for activity log
    const userProfile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { email: true },
    });

    // Log the action
    await db.activityLog.create({
      data: {
        userId: user.id,
        userEmail: userProfile?.email || '',
        action: 'update_setting',
        description: `Updated setting: ${key}`,
        metadata: {
          key,
          value: valueStr.substring(0, 100),
        },
      },
    });

    return NextResponse.json({
      success: true,
      setting: {
        key: setting.key,
        value: setting.value,
      },
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
