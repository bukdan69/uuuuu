import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

/**
 * Check if a user has a specific role
 */
export async function checkUserRole(userId: string, role: string): Promise<boolean> {
  try {
    const userRole = await db.userRole.findFirst({
      where: { 
        userId, 
        role 
      },
    });
    return !!userRole;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Check if current authenticated user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }
    
    return await checkUserRole(user.id, 'admin');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if current authenticated user is penjual
 */
export async function isPenjual(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }
    
    return await checkUserRole(user.id, 'penjual');
  } catch (error) {
    console.error('Error checking penjual status:', error);
    return false;
  }
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const userRoles = await db.userRole.findMany({
      where: { userId },
      select: { role: true },
    });
    
    // Always include 'user' as default role
    const roles = ['user', ...userRoles.map(r => r.role)];
    return [...new Set(roles)]; // Remove duplicates
  } catch (error) {
    console.error('Error getting user roles:', error);
    return ['user']; // Return default role on error
  }
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
  try {
    const userRoles = await getUserRoles(userId);
    return roles.some(role => userRoles.includes(role));
  } catch (error) {
    console.error('Error checking roles:', error);
    return false;
  }
}
