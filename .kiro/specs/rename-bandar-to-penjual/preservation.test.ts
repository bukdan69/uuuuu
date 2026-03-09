/**
 * Preservation Property Tests for Rename Bandar to Penjual
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
 * 
 * IMPORTANT: These tests follow observation-first methodology
 * 
 * These tests verify that role functionality remains unchanged after renaming
 * "bandar" to "penjual". They capture the baseline behavior on UNFIXED code
 * and ensure the same behavior persists after the fix.
 * 
 * EXPECTED OUTCOME: Tests PASS on unfixed code (establishes baseline)
 * After fix: Tests should still PASS (confirms no regressions)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Property 2: Preservation - Role Functionality Unchanged', () => {
  const projectRoot = process.cwd();

  /**
   * Property 2: Preservation - Role Functionality Unchanged
   * 
   * For any user with the seller role (currently "bandar", will be "penjual"),
   * the system SHALL provide exactly the same permissions, access rights, and
   * functionality as before the terminology change.
   */

  describe('Role Check Function Behavior', () => {
    it('should have a function to check seller role that returns boolean', () => {
      const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
      expect(existsSync(checkRolePath), 'checkRole.ts file should exist').toBe(true);
      
      const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
      
      // Should have a function that checks for seller role
      // Before fix: isBandar(), After fix: isPenjual()
      const hasSellerCheckFunction = 
        checkRoleContent.includes('function isBandar()') || 
        checkRoleContent.includes('function isPenjual()');
      
      expect(hasSellerCheckFunction, 'Should have seller role check function').toBe(true);
      
      // Function should return Promise<boolean>
      const functionMatch = checkRoleContent.match(
        /(async\s+function\s+(isBandar|isPenjual)\(\):\s*Promise<boolean>)/
      );
      expect(functionMatch, 'Seller check function should return Promise<boolean>').toBeTruthy();
    });

    it('should use checkUserRole helper with seller role string', () => {
      const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
      const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
      
      // Should call checkUserRole with seller role
      // Before fix: 'bandar', After fix: 'penjual'
      const hasSellerRoleCheck = 
        checkRoleContent.includes("checkUserRole(user.id, 'bandar')") ||
        checkRoleContent.includes("checkUserRole(user.id, 'penjual')");
      
      expect(hasSellerRoleCheck, 'Should check seller role using checkUserRole').toBe(true);
    });

    it('should preserve checkUserRole function signature and behavior', () => {
      const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
      const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
      
      // checkUserRole function should exist with same signature
      expect(checkRoleContent).toContain('function checkUserRole(userId: string, role: string): Promise<boolean>');
      
      // Should query database for user role
      expect(checkRoleContent).toContain('db.userRole.findFirst');
      expect(checkRoleContent).toContain('userId');
      expect(checkRoleContent).toContain('role');
    });

    it('should preserve isAdmin function unchanged', () => {
      const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
      const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
      
      // isAdmin should exist and be unchanged
      expect(checkRoleContent).toContain('function isAdmin()');
      expect(checkRoleContent).toContain("checkUserRole(user.id, 'admin')");
      
      // Should NOT reference bandar or penjual
      const isAdminFunction = checkRoleContent.match(/function isAdmin\(\)[^}]+}/s);
      expect(isAdminFunction).toBeTruthy();
      expect(isAdminFunction![0]).not.toContain('bandar');
      expect(isAdminFunction![0]).not.toContain('penjual');
    });

    it('should preserve getUserRoles function unchanged', () => {
      const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
      const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
      
      // getUserRoles should exist with same signature
      expect(checkRoleContent).toContain('function getUserRoles(userId: string): Promise<string[]>');
      
      // Should query all roles for user
      expect(checkRoleContent).toContain('db.userRole.findMany');
      
      // Should include 'user' as default role
      expect(checkRoleContent).toContain("'user'");
    });

    it('should preserve hasAnyRole function unchanged', () => {
      const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
      const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
      
      // hasAnyRole should exist with same signature
      expect(checkRoleContent).toContain('function hasAnyRole(userId: string, roles: string[]): Promise<boolean>');
      
      // Should use getUserRoles
      expect(checkRoleContent).toContain('getUserRoles(userId)');
    });
  });

  describe('API Endpoint Behavior', () => {
    it('should have check-role API endpoint that returns role information', () => {
      const apiRoutePath = join(projectRoot, 'src', 'app', 'api', 'auth', 'check-role', 'route.ts');
      expect(existsSync(apiRoutePath), 'check-role route should exist').toBe(true);
      
      const apiRouteContent = readFileSync(apiRoutePath, 'utf-8');
      
      // Should export GET handler
      expect(apiRouteContent).toContain('export async function GET');
      
      // Should authenticate user
      expect(apiRouteContent).toContain('supabase.auth.getUser()');
      
      // Should return 401 for unauthorized
      expect(apiRouteContent).toContain('401');
    });

    it('should return all user roles in response', () => {
      const apiRoutePath = join(projectRoot, 'src', 'app', 'api', 'auth', 'check-role', 'route.ts');
      const apiRouteContent = readFileSync(apiRoutePath, 'utf-8');
      
      // Should call getUserRoles
      expect(apiRouteContent).toContain('getUserRoles');
      
      // Should return roles array in response
      expect(apiRouteContent).toContain('roles');
    });

    it('should check admin role in response', () => {
      const apiRoutePath = join(projectRoot, 'src', 'app', 'api', 'auth', 'check-role', 'route.ts');
      const apiRouteContent = readFileSync(apiRoutePath, 'utf-8');
      
      // Should check admin role
      expect(apiRouteContent).toContain("checkUserRole(user.id, 'admin')");
      expect(apiRouteContent).toContain('isAdmin');
    });

    it('should check seller role in response with appropriate field name', () => {
      const apiRoutePath = join(projectRoot, 'src', 'app', 'api', 'auth', 'check-role', 'route.ts');
      const apiRouteContent = readFileSync(apiRoutePath, 'utf-8');
      
      // Should check seller role
      // Before fix: isBandar with 'bandar', After fix: isPenjual with 'penjual'
      const hasSellerCheck = 
        (apiRouteContent.includes("checkUserRole(user.id, 'bandar')") && apiRouteContent.includes('isBandar')) ||
        (apiRouteContent.includes("checkUserRole(user.id, 'penjual')") && apiRouteContent.includes('isPenjual'));
      
      expect(hasSellerCheck, 'Should check seller role with appropriate field name').toBe(true);
    });

    it('should return userId and email in response', () => {
      const apiRoutePath = join(projectRoot, 'src', 'app', 'api', 'auth', 'check-role', 'route.ts');
      const apiRouteContent = readFileSync(apiRoutePath, 'utf-8');
      
      // Should return user identification
      expect(apiRouteContent).toContain('userId');
      expect(apiRouteContent).toContain('email');
    });
  });

  describe('Database Schema Preservation', () => {
    it('should preserve UserRole model structure', () => {
      const schemaPath = join(projectRoot, 'prisma', 'schema.prisma');
      expect(existsSync(schemaPath), 'Prisma schema should exist').toBe(true);
      
      const schemaContent = readFileSync(schemaPath, 'utf-8');
      
      // UserRole model should exist with same fields
      expect(schemaContent).toContain('model UserRole');
      expect(schemaContent).toContain('id         String');
      expect(schemaContent).toContain('userId     String');
      expect(schemaContent).toContain('role       String');
      expect(schemaContent).toContain('assignedBy String?');
      expect(schemaContent).toContain('createdAt  DateTime');
    });

    it('should preserve UserRole relation to Profile', () => {
      const schemaPath = join(projectRoot, 'prisma', 'schema.prisma');
      const schemaContent = readFileSync(schemaPath, 'utf-8');
      
      // Should have relation to Profile
      const userRoleModel = schemaContent.match(/model UserRole\s*{[^}]+}/s);
      expect(userRoleModel).toBeTruthy();
      expect(userRoleModel![0]).toContain('profile Profile @relation');
      expect(userRoleModel![0]).toContain('fields: [userId]');
      expect(userRoleModel![0]).toContain('references: [userId]');
    });

    it('should preserve Profile model userRoles relation', () => {
      const schemaPath = join(projectRoot, 'prisma', 'schema.prisma');
      const schemaContent = readFileSync(schemaPath, 'utf-8');
      
      // Profile should have userRoles relation
      const profileModel = schemaContent.match(/model Profile\s*{[^}]+userRoles[^}]+}/s);
      expect(profileModel).toBeTruthy();
      expect(profileModel![0]).toContain('userRoles             UserRole[]');
    });

    it('should have exactly three role values in enum/comment', () => {
      const schemaPath = join(projectRoot, 'prisma', 'schema.prisma');
      const schemaContent = readFileSync(schemaPath, 'utf-8');
      
      // Should reference three roles: user, admin, and seller (bandar or penjual)
      const userRoleModel = schemaContent.match(/model UserRole\s*{[^}]+}/s);
      expect(userRoleModel).toBeTruthy();
      
      const roleComment = userRoleModel![0].match(/\/\/[^\n]*(?:user|admin|bandar|penjual)[^\n]*/);
      expect(roleComment, 'Should have comment describing roles').toBeTruthy();
      
      // Should mention user and admin
      expect(roleComment![0]).toContain('user');
      expect(roleComment![0]).toContain('admin');
      
      // Should mention either bandar or penjual (seller role)
      const hasSellerRole = roleComment![0].includes('bandar') || roleComment![0].includes('penjual');
      expect(hasSellerRole, 'Should mention seller role').toBe(true);
    });
  });

  describe('TypeScript Type Definitions Preservation', () => {
    it('should preserve Supabase database types structure', () => {
      const supabasePath = join(projectRoot, 'src', 'lib', 'supabase.ts');
      expect(existsSync(supabasePath), 'supabase.ts should exist').toBe(true);
      
      const supabaseContent = readFileSync(supabasePath, 'utf-8');
      
      // Should have Database interface
      expect(supabaseContent).toContain('interface Database');
      
      // Should have Enums section
      expect(supabaseContent).toContain('Enums:');
    });

    it('should have app_role enum with three values', () => {
      const supabasePath = join(projectRoot, 'src', 'lib', 'supabase.ts');
      const supabaseContent = readFileSync(supabasePath, 'utf-8');
      
      // Should have app_role enum
      const appRoleEnum = supabaseContent.match(/app_role:\s*['"]user['"]\s*\|\s*['"]admin['"]\s*\|\s*['"](\w+)['"]/);
      expect(appRoleEnum, 'Should have app_role enum with three values').toBeTruthy();
      
      // Third value should be seller role (bandar or penjual)
      const thirdRole = appRoleEnum![1];
      expect(['bandar', 'penjual']).toContain(thirdRole);
    });

    it('should preserve has_role function type definition', () => {
      const supabasePath = join(projectRoot, 'src', 'lib', 'supabase.ts');
      const supabaseContent = readFileSync(supabasePath, 'utf-8');
      
      // Should have has_role function definition
      expect(supabaseContent).toContain('has_role:');
      expect(supabaseContent).toContain('Args:');
      expect(supabaseContent).toContain('_user_id: string');
      expect(supabaseContent).toContain('Returns: boolean');
    });

    it('should have has_role function with three role options', () => {
      const supabasePath = join(projectRoot, 'src', 'lib', 'supabase.ts');
      const supabaseContent = readFileSync(supabasePath, 'utf-8');
      
      // has_role Args should include role union type
      const hasRoleArgs = supabaseContent.match(/has_role:[^}]+Args:[^}]+_role:[^;]+/s);
      expect(hasRoleArgs, 'Should have has_role Args definition').toBeTruthy();
      
      // Should have three role options
      expect(hasRoleArgs![0]).toContain('user');
      expect(hasRoleArgs![0]).toContain('admin');
      
      // Should have seller role (bandar or penjual)
      const hasSellerRole = hasRoleArgs![0].includes('bandar') || hasRoleArgs![0].includes('penjual');
      expect(hasSellerRole, 'Should include seller role in has_role Args').toBe(true);
    });

    it('should preserve other enum types unchanged', () => {
      const supabasePath = join(projectRoot, 'src', 'lib', 'supabase.ts');
      const supabaseContent = readFileSync(supabasePath, 'utf-8');
      
      // Other enums should be present and unchanged
      expect(supabaseContent).toContain('listing_status:');
      expect(supabaseContent).toContain('listing_price_type:');
      expect(supabaseContent).toContain('listing_type:');
      expect(supabaseContent).toContain('wallet_status:');
    });
  });

  describe('Administrative Scripts Preservation', () => {
    it('should preserve assign-role script functionality', () => {
      const scriptPath = join(projectRoot, 'scripts', 'assign-role.ts');
      
      if (existsSync(scriptPath)) {
        const scriptContent = readFileSync(scriptPath, 'utf-8');
        
        // Should have role type definition with admin and seller
        const roleTypeMatch = scriptContent.match(/const\s+roleToAssign:\s*['"]admin['"]\s*\|\s*['"](\w+)['"]/);
        expect(roleTypeMatch, 'Should have roleToAssign type definition').toBeTruthy();
        
        // Should include seller role (bandar or penjual)
        const sellerRole = roleTypeMatch![1];
        expect(['bandar', 'penjual']).toContain(sellerRole);
        
        // Should create user role record
        expect(scriptContent).toContain('userRole.create');
      }
    });

    it('should preserve remove-role script functionality', () => {
      const scriptPath = join(projectRoot, 'scripts', 'remove-role.ts');
      
      if (existsSync(scriptPath)) {
        const scriptContent = readFileSync(scriptPath, 'utf-8');
        
        // Should have role type definition
        const roleTypeMatch = scriptContent.match(/const\s+roleToRemove:\s*['"]admin['"]\s*\|\s*['"](\w+)['"]/);
        expect(roleTypeMatch, 'Should have roleToRemove type definition').toBeTruthy();
        
        // Should delete user role record
        expect(scriptContent).toContain('userRole.delete');
      }
    });

    it('should preserve list-all-roles script functionality', () => {
      const scriptPath = join(projectRoot, 'scripts', 'list-all-roles.ts');
      
      if (existsSync(scriptPath)) {
        const scriptContent = readFileSync(scriptPath, 'utf-8');
        
        // Should query all roles
        expect(scriptContent).toContain('userRole.findMany');
        
        // Should filter by seller role
        const hasSellerFilter = 
          scriptContent.includes("r.role === 'bandar'") ||
          scriptContent.includes("r.role === 'penjual'");
        
        expect(hasSellerFilter, 'Should filter seller users').toBe(true);
        
        // Should log results
        expect(scriptContent).toContain('console.log');
      }
    });
  });

  describe('Authentication Flow Preservation', () => {
    it('should preserve Supabase client configuration', () => {
      const supabasePath = join(projectRoot, 'src', 'lib', 'supabase.ts');
      const supabaseContent = readFileSync(supabasePath, 'utf-8');
      
      // Should have client configuration
      expect(supabaseContent).toContain('createClient');
      expect(supabaseContent).toContain('NEXT_PUBLIC_SUPABASE_URL');
      expect(supabaseContent).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    });

    it('should preserve authentication in role check functions', () => {
      const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
      const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
      
      // Role check functions should get authenticated user
      expect(checkRoleContent).toContain('supabase.auth.getUser()');
      
      // Should handle auth errors
      expect(checkRoleContent).toContain('error || !user');
      expect(checkRoleContent).toContain('return false');
    });

    it('should preserve session validation in API endpoint', () => {
      const apiRoutePath = join(projectRoot, 'src', 'app', 'api', 'auth', 'check-role', 'route.ts');
      const apiRouteContent = readFileSync(apiRoutePath, 'utf-8');
      
      // Should validate session
      expect(apiRouteContent).toContain('supabase.auth.getUser()');
      
      // Should return 401 for invalid session
      expect(apiRouteContent).toContain('authError || !user');
      expect(apiRouteContent).toContain('Unauthorized');
      expect(apiRouteContent).toContain('401');
    });
  });

  describe('Database Query Preservation', () => {
    it('should preserve database query structure in checkUserRole', () => {
      const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
      const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
      
      // Should use findFirst with where clause
      expect(checkRoleContent).toContain('db.userRole.findFirst');
      expect(checkRoleContent).toContain('where:');
      
      // Should filter by userId and role
      const checkUserRoleFunction = checkRoleContent.match(/function checkUserRole[\s\S]+?^}/m);
      expect(checkUserRoleFunction, 'checkUserRole function should exist').toBeTruthy();
      expect(checkUserRoleFunction![0]).toContain('userId');
      expect(checkUserRoleFunction![0]).toContain('role');
    });

    it('should preserve database query structure in getUserRoles', () => {
      const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
      const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
      
      // Should use findMany with where clause
      expect(checkRoleContent).toContain('db.userRole.findMany');
      expect(checkRoleContent).toContain('where:');
      
      // Should filter by userId
      const getUserRolesFunction = checkRoleContent.match(/function getUserRoles[\s\S]+?^}/m);
      expect(getUserRolesFunction, 'getUserRoles function should exist').toBeTruthy();
      expect(getUserRolesFunction![0]).toContain('userId');
      
      // Should select role field
      expect(getUserRolesFunction![0]).toContain('select');
      expect(getUserRolesFunction![0]).toContain('role: true');
    });

    it('should preserve error handling in database queries', () => {
      const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
      const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
      
      // Should have try-catch blocks
      expect(checkRoleContent).toContain('try {');
      expect(checkRoleContent).toContain('catch (error)');
      
      // Should log errors
      expect(checkRoleContent).toContain('console.error');
      
      // Should return safe defaults on error
      expect(checkRoleContent).toContain('return false');
      expect(checkRoleContent).toContain("return ['user']");
    });
  });

  describe('Cross-Role Isolation', () => {
    it('should not affect admin role references', () => {
      const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
      const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
      
      // Admin role should be exactly 'admin' (unchanged)
      const adminChecks = checkRoleContent.match(/checkUserRole\([^,]+,\s*['"]admin['"]\)/g);
      expect(adminChecks, 'Should have admin role checks').toBeTruthy();
      expect(adminChecks!.length).toBeGreaterThan(0);
      
      // Admin checks should not reference seller role
      adminChecks!.forEach(check => {
        expect(check).not.toContain('bandar');
        expect(check).not.toContain('penjual');
      });
    });

    it('should not affect user role references', () => {
      const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
      const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
      
      // User role should be exactly 'user' (unchanged)
      const userReferences = checkRoleContent.match(/['"]user['"]/g);
      expect(userReferences, 'Should have user role references').toBeTruthy();
      
      // getUserRoles should include 'user' as default
      expect(checkRoleContent).toContain("const roles = ['user'");
    });

    it('should maintain three distinct roles', () => {
      const supabasePath = join(projectRoot, 'src', 'lib', 'supabase.ts');
      const supabaseContent = readFileSync(supabasePath, 'utf-8');
      
      // app_role enum should have exactly three values
      const appRoleEnum = supabaseContent.match(/app_role:\s*['"]user['"]\s*\|\s*['"]admin['"]\s*\|\s*['"](\w+)['"]/);
      expect(appRoleEnum, 'Should have three role values').toBeTruthy();
      
      // Count the pipe operators (should be 2 for 3 values)
      const pipeCount = (appRoleEnum![0].match(/\|/g) || []).length;
      expect(pipeCount).toBe(2);
    });
  });
});
